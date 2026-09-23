"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { authStorage } from "@/lib/authStorage";
import {
  exchangeLoginCode,
  extractLoginCode,
  stripLoginCode,
} from "@/lib/loginCode";
import { normalizeLoginUser } from "@/lib/loginResponse";

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

  // Guards the exchange against React strict mode running effects twice in
  // dev: the first run strips the code from the URL, so the second run would
  // otherwise see "no code" and mark the context hydrated too early.
  const loginCodeExchangeStartedRef = useRef(false);

  // Hydration. Sits below `login` because its dependency array reads it.
  useEffect(() => {
    if (loginCodeExchangeStartedRef.current) return;

    const storedToken = authStorage.getToken();
    const storedTokenExpiry = window.sessionStorage.getItem(
      AUTH_TOKEN_EXPIRY_STORAGE_KEY,
    );
    const storedUser = window.sessionStorage.getItem(AUTH_USER_STORAGE_KEY);

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

    const loginCode = extractLoginCode(window.location.search);
    if (!loginCode) {
      setIsHydrated(true);
      return;
    }

    // Arriving from the set-password page. Strip the code first so it never
    // lingers in the address bar or history, then trade it for a session.
    // isHydrated waits for the outcome so the save/resume logic sees the
    // final auth state once.
    loginCodeExchangeStartedRef.current = true;
    window.history.replaceState(
      window.history.state,
      "",
      stripLoginCode(window.location.href),
    );
    void exchangeLoginCode(loginCode)
      .then((data) => {
        if (!data?.api_key) return;
        const nextUser = normalizeLoginUser(data.user);
        login({
          token: data.api_key,
          expiresAt: data.api_key_expires,
          user: nextUser,
        });
        toast.success(`Signed in as ${nextUser.email}`);
      })
      .finally(() => setIsHydrated(true));
  }, [login]);

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
