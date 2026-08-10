export interface Debounced<T extends unknown[]> {
  (...args: T): void;
  cancel(): void;
}

export function createDebounced<T extends unknown[]>(
  fn: (...args: T) => void,
  delayMs: number,
): Debounced<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: T) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}
