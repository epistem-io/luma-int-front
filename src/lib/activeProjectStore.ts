export const ACTIVE_PROJECT_STORAGE_KEY = "luma.activeProject.v1";

export interface ActiveProject {
  id: string;
  name: string;
  // The backend session this project owns. A checkpoint is only ever synced
  // to the project whose sessionId matches its own.
  sessionId: string;
}

const canUseBrowserStorage = () => typeof window !== "undefined";

function isValidActiveProject(value: unknown): value is ActiveProject {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.sessionId === "string"
  );
}

function removeEntry() {
  try {
    window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
  } catch {
  }
}

// Remembers which named project the localStorage checkpoint belongs to, so a
// reload + resume re-attaches auto-sync instead of orphaning the project.
export const activeProjectStore = {
  save(project: ActiveProject): void {
    if (!canUseBrowserStorage()) return;
    try {
      window.localStorage.setItem(
        ACTIVE_PROJECT_STORAGE_KEY,
        JSON.stringify(project),
      );
    } catch {
    }
  },

  loadFor(sessionId: string): ActiveProject | null {
    if (!canUseBrowserStorage() || sessionId === "") return null;
    try {
      const raw = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isValidActiveProject(parsed)) {
        removeEntry();
        return null;
      }
      return parsed.sessionId === sessionId ? parsed : null;
    } catch {
      removeEntry();
      return null;
    }
  },

  clear(): void {
    if (!canUseBrowserStorage()) return;
    removeEntry();
  },
};
