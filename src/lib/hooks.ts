import { useCallback, useLayoutEffect, useRef, useState } from "react";

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

export { useObservedHeight };
