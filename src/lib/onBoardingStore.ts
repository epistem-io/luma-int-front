export const ONBOARDING_STORE_KEY = "luma.onboarding.v1";

const canUseBrowserStorage = () => typeof window !== "undefined"

export const onboardingStore = {
  hasCompleted(): boolean {
    if (!canUseBrowserStorage()) return false;
    try {
      return window.localStorage.getItem(ONBOARDING_STORE_KEY) !== null;
    } catch {
      return true;
    }
  },

  markCompleted(): void {
    if (!canUseBrowserStorage()) return;
    try {
      window.localStorage.setItem(ONBOARDING_STORE_KEY, new Date().toISOString());
    } catch {
    }
  },

  reset(): void {
    if (!canUseBrowserStorage()) return;
    try {
      window.localStorage.removeItem(ONBOARDING_STORE_KEY);
    } catch {
    }
  },
};