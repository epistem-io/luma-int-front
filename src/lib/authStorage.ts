"use client";

const AUTH_TOKEN_STORAGE_KEY = "luma.auth.token";

const canUseBrowserStorage = () => typeof window !== "undefined";

export const authStorage = {
  getToken() {
    if (!canUseBrowserStorage()) {
      return null;
    }

    return window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  },
  setToken(token: string) {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  },
  clearToken() {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  },
};
