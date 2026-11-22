import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { savingTransitionStore } from "./savingTransitionStore";

function useObservedHeight<T extends HTMLElement>() {
  const observerRef = useRef<ResizeObserver | null>(null);
  const [element, setElement] = useState<T | null>(null);
  const [height, setHeight] = useState(0);

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useLayoutEffect(() => {
    if (!element) {
      setHeight(0);
      return;
    }

    setHeight(element.getBoundingClientRect().height);

    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [element]);

  return { ref, height };
}

// Brief "Saving…" feedback on step-transition buttons: the checkpoint write
// itself is near-instant, so the state is held for a minimum visible window
// before (and, for async actions, during) the transition.
const SAVING_FEEDBACK_MS = 600;

function useSavingTransition() {
  const [isSaving, setIsSaving] = useState(false);
  const pendingRef = useRef(false);

  const runWithSaving = useCallback((action: () => void | Promise<void>) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setIsSaving(true);
    // App-wide, so navigation (the step bar) waits for this action too.
    savingTransitionStore.begin();
    window.setTimeout(() => {
      void Promise.resolve()
        .then(() => action())
        .finally(() => {
          pendingRef.current = false;
          setIsSaving(false);
          savingTransitionStore.end();
        });
    }, SAVING_FEEDBACK_MS);
  }, []);

  return { isSaving, runWithSaving };
}

// True while any useSavingTransition action, anywhere, is still running.
function useIsSavingTransitionPending() {
  return useSyncExternalStore(
    savingTransitionStore.subscribe,
    savingTransitionStore.isPending,
    () => false,
  );
}

export { useIsSavingTransitionPending, useObservedHeight, useSavingTransition };
