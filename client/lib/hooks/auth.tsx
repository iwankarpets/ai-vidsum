import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../api/types";
import { useRouter } from "next/navigation";
import { setTokenGetter } from "../api/client";
import { authApi } from "../api/auth";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  token: string | null;
  login: (token: string, user: User) => void;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      authApi
        .getCurrentUser()
        .then((response) => {
          setUser(response.user);
        })
        .catch(() => {
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = (newToken: string, user: User) => {
    setToken(newToken);
    setUser(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    router.push("/auth/login");
  };

  const register = async (data: any) => {
    const { token: newToken, user: newUser } = await authApi.register(data);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  return { user, loading };
}
