import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();

const AUTH_SECRET = process.env.AUTH_SECRET || "luna-dev-secret";

type SafeRole = "student" | "teacher";

type JwtPayload = {
  userId: string;
  role: SafeRole;
};

function normalizeRole(role: unknown): SafeRole {
  return role === "teacher" ? "teacher" : "student";
}

function createToken(userId: string, role: SafeRole) {
  return jwt.sign(
    {
      userId,
      role,
    },
    AUTH_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function getAuthToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) return null;

  const [type, token] = authorizationHeader.split(" ");

  if (type !== "Bearer" || !token) return null;

  return token;
}

function verifyAuthToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, AUTH_SECRET) as Partial<JwtPayload>;

    if (!payload.userId) {
      return null;
    }

    return {
      userId: payload.userId,
      role: normalizeRole(payload.role),
    };
  } catch {
    return null;
  }
}

function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  level: string | null;
  assessmentDone: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    plan: user.plan ?? "free",
    level: user.level ?? null,
    assessmentDone: Boolean(user.assessmentDone),
    createdAt: user.createdAt,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const requestedRole = normalizeRole(req.body.role);

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required.",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "This email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
        role: requestedRole,
        plan: "free",
        level: null,
        assessmentDone: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        level: true,
        assessmentDone: true,
        createdAt: true,
      },
    });

    const userForClient = safeUser(user);
    const token = createToken(user.id, userForClient.role);

    return res.status(201).json({
      token,
      user: userForClient,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      error: "Failed to register user.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      String(password),
      user.passwordHash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    /*
      Backward compatibility:
      Old test users may still have role = "individual".
      safeUser() converts anything except "teacher" to "student".
      New registrations will only save "student" or "teacher".
    */
    const userForClient = safeUser(user);
    const token = createToken(user.id, userForClient.role);

    return res.json({
      token,
      user: userForClient,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Failed to log in.",
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = getAuthToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: "Missing auth token.",
      });
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return res.status(401).json({
        error: "Invalid auth token.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        level: true,
        assessmentDone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.json({
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Me error:", error);

    return res.status(500).json({
      error: "Failed to load user.",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    /*
      Do not reveal whether the email exists.
      For the MVP demo, if the email exists, we still return devResetCode.
    */
    if (!user) {
      return res.json({
        message:
          "If this email exists, a password reset code has been created.",
      });
    }

    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    const resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetCode,
        resetCodeExpiresAt,
      },
    });

    return res.json({
      message:
        "Password reset code created. In this MVP demo, the code is returned directly.",
      devResetCode: resetCode,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      error: "Failed to create reset code.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        error: "Email, reset code, and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
      return res.status(400).json({
        error: "Invalid or expired reset code.",
      });
    }

    const resetCodeIsExpired = user.resetCodeExpiresAt.getTime() < Date.now();

    if (resetCodeIsExpired || user.resetCode !== String(resetCode)) {
      return res.status(400).json({
        error: "Invalid or expired reset code.",
      });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        resetCode: null,
        resetCodeExpiresAt: null,
      },
    });

    return res.json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      error: "Failed to reset password.",
    });
  }
});

export default router;
