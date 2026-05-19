"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authStorage } from "@/lib/authStorage";

export interface AuthUser {
  id?: string | number;
  email: string;
  name?: string;
  organizationName?: string;
  roles?: string[];
}

interface LoginParams {
  token: string;
  expiresAt?: string;
  user: AuthUser;
}

interface AuthContextType {
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: AuthUser | null;
  login: (params: LoginParams) => void;
  logout: () => void;
}

const DEFAULT_VALUE: AuthContextType = {
  accessToken: null,
  accessTokenExpiresAt: null,
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  login: () => {},
  logout: () => {},
};

const AUTH_USER_STORAGE_KEY = "luma.auth.user";
const AUTH_TOKEN_EXPIRY_STORAGE_KEY = "luma.auth.token_expires_at";

const AuthContext = createContext<AuthContextType>(DEFAULT_VALUE);

const AuthContextContainer = ({ children }: PropsWithChildren) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<
    string | null
  >(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedToken = authStorage.getToken();
    const storedTokenExpiry =
      typeof window === "undefined"
        ? null
        : window.sessionStorage.getItem(AUTH_TOKEN_EXPIRY_STORAGE_KEY);
    const storedUser =
      typeof window === "undefined"
        ? null
        : window.sessionStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (storedToken) {
      setAccessToken(storedToken);
    }

    if (storedTokenExpiry) {
      setAccessTokenExpiresAt(storedTokenExpiry);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
      }
    }

    setIsHydrated(true);
  }, []);

  const login = useCallback(
    ({ token, expiresAt, user: nextUser }: LoginParams) => {
      authStorage.setToken(token);
      setAccessToken(token);
      setAccessTokenExpiresAt(expiresAt ?? null);
      setUser(nextUser);

      if (typeof window !== "undefined") {
        if (expiresAt) {
          window.sessionStorage.setItem(
            AUTH_TOKEN_EXPIRY_STORAGE_KEY,
            expiresAt,
          );
        } else {
          window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_STORAGE_KEY);
        }

        window.sessionStorage.setItem(
          AUTH_USER_STORAGE_KEY,
          JSON.stringify(nextUser),
        );
      }
    },
    [],
  );

  const logout = useCallback(() => {
    authStorage.clearToken();
    setAccessToken(null);
    setAccessTokenExpiresAt(null);
    setUser(null);

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  }, []);

  const providedValue = useMemo(
    () => ({
      accessToken,
      accessTokenExpiresAt,
      isAuthenticated: Boolean(accessToken && user),
      isHydrated,
      user,
      login,
      logout,
    }),
    [accessToken, accessTokenExpiresAt, isHydrated, login, logout, user],
  );

  return (
    <AuthContext.Provider value={providedValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthContextContainer };
