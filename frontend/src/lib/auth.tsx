import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

const TOKEN_STORAGE_KEY = "luna_auth_token";

export type UserRole = "student" | "teacher";

export type LunaUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: string;
  level: string | null;
  assessmentDone: boolean;
  createdAt?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  email: string;
  resetCode: string;
  newPassword: string;
};

type AuthResponse = {
  token: string;
  user: LunaUser;
};

type ForgotPasswordResponse = {
  message: string;
  devResetCode?: string;
};

type AuthContextValue = {
  user: LunaUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LunaUser>;
  register: (payload: RegisterPayload) => Promise<LunaUser>;
  forgotPassword: (
    payload: ForgotPasswordPayload
  ) => Promise<ForgotPasswordResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<{ message: string }>;
  refreshUser: () => Promise<LunaUser | null>;
  updateUser: (user: LunaUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function requestJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  return data as T;
}

function normalizeUser(rawUser: LunaUser): LunaUser {
  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    role: rawUser.role === "teacher" ? "teacher" : "student",
    plan: rawUser.plan ?? "free",
    level: rawUser.level ?? null,
    assessmentDone: Boolean(rawUser.assessmentDone),
    createdAt: rawUser.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [user, setUser] = useState<LunaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function saveAuth(authResponse: AuthResponse) {
    const normalizedUser = normalizeUser(authResponse.user);

    localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.token);
    setToken(authResponse.token);
    setUser(normalizedUser);

    return normalizedUser;
  }

  async function login(payload: LoginPayload) {
    const authResponse = await requestJson<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return saveAuth(authResponse);
  }

  async function register(payload: RegisterPayload) {
    const authResponse = await requestJson<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        role: payload.role ?? "student",
      }),
    });

    return saveAuth(authResponse);
  }

  async function forgotPassword(payload: ForgotPasswordPayload) {
    return requestJson<ForgotPasswordResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function resetPassword(payload: ResetPasswordPayload) {
    return requestJson<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function refreshUser() {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const result = await requestJson<{ user: LunaUser }>("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const normalizedUser = normalizeUser(result.user);
      setUser(normalizedUser);
      return normalizedUser;
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function updateUser(nextUser: LunaUser) {
    setUser(normalizeUser(nextUser));
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      forgotPassword,
      resetPassword,
      refreshUser,
      updateUser,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}