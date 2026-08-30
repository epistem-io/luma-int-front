import {
  CHECKPOINT_VERSION,
  type SessionCheckpoint,
} from "@/lib/sessionCheckpoint";

export const SESSION_STORAGE_KEY = "luma.session.v1";

const canUseBrowserStorage = () => typeof window !== "undefined";

function isValidCheckpoint(value: unknown): value is SessionCheckpoint {
  if (typeof value !== "object" || value === null) return false;
  const cp = value as Record<string, unknown>;
  const owner = cp.owner as Record<string, unknown> | null | undefined;
  const ownerValid = 
    owner === null ||
    (typeof owner === "object" && typeof owner.email === "string");
  return (
    (cp.version === 1 || cp.version === CHECKPOINT_VERSION) &&
    typeof cp.savedAt === "string" &&
    typeof cp.sessionId === "string" &&
    typeof cp.stepKey === "string" &&
    typeof cp.progressPanelIndex === "number" &&
    typeof cp.lastStepWithData === "number" &&
    cp.lastStepWithData >= 1 &&
    cp.lastStepWithData <= 5 &&
    ownerValid
  );
}

function removeEntry() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
  }
}

export const sessionStore = {
  async save(checkpoint: SessionCheckpoint): Promise<void> {
    if (!canUseBrowserStorage()) return;
    try {
      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(checkpoint),
      );
    } catch {
    }
  },

  async load(): Promise<SessionCheckpoint | null> {
    if (!canUseBrowserStorage()) return null;
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isValidCheckpoint(parsed)) {
        removeEntry();
        return null;
      }
      return { ...parsed, version: CHECKPOINT_VERSION };
    } catch {
      removeEntry();
      return null;
    }
  },

  async clear(): Promise<void> {
    if (!canUseBrowserStorage()) return;
    removeEntry();
  },
};
