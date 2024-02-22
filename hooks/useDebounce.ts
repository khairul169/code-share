import { useCallback, useRef } from "react";

export const useDebounce = (fn: Function, delay = 500) => {
  const timerRef = useRef<any>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debounce = useCallback(
    (...params: any[]) => {
      cancel();

      timerRef.current = setTimeout(() => {
        fn(...params);
        timerRef.current = null;
      }, delay);
    },
    [fn, delay, cancel]
  );

  return [debounce, cancel] as [typeof debounce, typeof cancel];
};
