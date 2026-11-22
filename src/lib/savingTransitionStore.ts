// Counts step actions still in flight (useSavingTransition's delayed actions,
// including any async submit they await), so the step bar can wait for them
// instead of being overridden when they land.
let pendingCount = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const savingTransitionStore = {
  begin() {
    pendingCount += 1;
    notify();
  },
  end() {
    pendingCount = Math.max(0, pendingCount - 1);
    notify();
  },
  isPending: () => pendingCount > 0,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
