import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();

const AUTH_SECRET = process.env.AUTH_SECRET || "luna-dev-secret";

type UserRole = "student" | "teacher";

function isAllowedRole(role: unknown): role is UserRole {
  return role === "student" || role === "teacher";
}

function createToken(userId: string, role: string) {
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
    role: user.role,
    plan: user.plan,
    level: user.level,
    assessmentDone: user.assessmentDone,
    createdAt: user.createdAt,
  };
}

function getAuthToken(headerValue: string | undefined) {
  if (!headerValue) return null;

  const [type, token] = headerValue.split(" ");

  if (type !== "Bearer" || !token) return null;

  return token;
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, AUTH_SECRET) as {
      userId: string;
      role?: string;
    };
  } catch {
    return null;
  }
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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

    const requestedRole = role ?? "student";

    if (!isAllowedRole(requestedRole)) {
      return res.status(400).json({
        error: 'Role must be either "student" or "teacher".',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: String(email).toLowerCase(),
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "This email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: String(name),
        email: String(email).toLowerCase(),
        passwordHash,
        role: requestedRole,
        plan: "free",
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

    const token = createToken(user.id, user.role);

    return res.json({
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error(error);

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

    const user = await prisma.user.findUnique({
      where: {
        email: String(email).toLowerCase(),
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const token = createToken(user.id, user.role);

    return res.json({
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error(error);

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

    const payload = verifyToken(token);
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
    console.error(error);

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

    const user = await prisma.user.findUnique({
      where: {
        email: String(email).toLowerCase(),
      },
    });

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
        "Password reset code created. In the MVP demo, the code is returned directly.",
      devResetCode: resetCode,
    });
  } catch (error) {
    console.error(error);

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

    const user = await prisma.user.findUnique({
      where: {
        email: String(email).toLowerCase(),
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

    const passwordHash = await bcrypt.hash(newPassword, 10);

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
    console.error(error);

    return res.status(500).json({
      error: "Failed to reset password.",
    });
  }
});

export default router;