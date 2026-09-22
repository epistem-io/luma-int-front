import { LOGIN_CODE_URL } from "@/constants";
import type { LoginResponse } from "./loginResponse";

// One-time code the set-password page (landing site, another origin) appends
// when it sends a freshly activated user to Luma. It is exchanged for the real
// token server-side; the api_key itself never travels in a URL.
export const LOGIN_CODE_PARAM = "login_code";

export const extractLoginCode = (search: string): string | null => {
  const value = new URLSearchParams(search).get(LOGIN_CODE_PARAM);
  return value && value.trim() ? value : null;
};

// Path + query + hash without the code, for history.replaceState.
export const stripLoginCode = (href: string): string => {
  const url = new URL(href);
  url.searchParams.delete(LOGIN_CODE_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
};

// null = the code was rejected/expired or the request failed; the caller just
// leaves the user logged out.
export const exchangeLoginCode = async (
  code: string,
): Promise<LoginResponse | null> => {
  try {
    const response = await fetch(LOGIN_CODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) return null;
    return (await response.json()) as LoginResponse;
  } catch {
    return null;
  }
};
