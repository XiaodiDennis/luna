import { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";
const TOKEN_KEY = "luna_auth_token";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  forgotPassword: (payload: { email: string }) => Promise<{
    message: string;
    devResetCode?: string;
  }>;
  resetPassword: (payload: {
    email: string;
    resetCode: string;
    newPassword: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function requestAuth(
  path: string,
  payload: { name?: string; email: string; password?: string }
) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Authentication failed.");
  }

  return data as {
    user: User;
    token: string;
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token expired or invalid.");
        }

        const data = await response.json();

        if (!isMounted) return;
        setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!isMounted) return;
        setToken(null);
        setUser(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      token,
      isLoading,
      async register(payload) {
        const data = await requestAuth("/api/auth/register", payload);
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
      },
      async login(payload) {
        const data = await requestAuth("/api/auth/login", payload);
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
      },
      async forgotPassword(payload) {
        const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to create reset code.");
        }

        return data;
      },
      async resetPassword(payload) {
        const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to reset password.");
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      },
    };
  }, [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
