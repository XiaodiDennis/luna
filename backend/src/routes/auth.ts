import crypto from "crypto";
import { Router } from "express";
import { prisma } from "../lib/prisma";

export const authRouter = Router();

const AUTH_SECRET = process.env.AUTH_SECRET ?? "luna-dev-secret-change-me";

// MVP-only in-memory reset code store.
// In production, reset codes should be stored with expiry in DB or Redis and sent by email.
const passwordResetCodes = new Map<
  string,
  {
    code: string;
    expiresAt: number;
  }
>();

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const candidateHash = crypto.scryptSync(password, salt, 64).toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(candidateHash, "hex")
  );
}

function createToken(userId: string) {
  const payload = {
    userId,
    issuedAt: Date.now(),
  };

  const payloadEncoded = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadEncoded)
    .digest("base64url");

  return `${payloadEncoded}.${signature}`;
}

function verifyToken(token: string) {
  const [payloadEncoded, signature] = token.split(".");

  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadEncoded)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadEncoded, "base64url").toString("utf-8")
    );

    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

function normalizeEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

function createResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    createdAt: user.createdAt,
  };
}

authRouter.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? "");

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "This email is already registered." });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role: "individual",
        plan: "free",
      },
    });

    res.status(201).json({
      user: publicUser(user),
      token: createToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed." });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
      user: publicUser(user),
      token: createToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed." });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Do not reveal whether email exists in a real product.
    // For MVP/demo, return a dev reset code only when the user exists.
    if (!user) {
      return res.json({
        ok: true,
        message:
          "Якщо цей email зареєстрований, інструкцію для відновлення пароля буде надіслано.",
      });
    }

    const code = createResetCode();

    passwordResetCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    res.json({
      ok: true,
      message:
        "Код відновлення створено. У production-версії він має надсилатися email-листом.",
      devResetCode: code,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create reset code." });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const resetCode = String(req.body.resetCode ?? "").trim();
    const newPassword = String(req.body.newPassword ?? "");

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        error: "Email, reset code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters." });
    }

    const resetRecord = passwordResetCodes.get(email);

    if (
      !resetRecord ||
      resetRecord.code !== resetCode ||
      resetRecord.expiresAt < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired reset code." });
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashPassword(newPassword),
      },
    });

    passwordResetCodes.delete(email);

    res.json({
      ok: true,
      message: "Пароль оновлено.",
      user: publicUser(user),
      token: createToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password." });
  }
});

authRouter.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const userId = verifyToken(token);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    res.json({
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load account." });
  }
});
