import { useCallback, useEffect, useRef, useState } from "react";

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export type Breakpoint = keyof typeof breakpoints;

export const breakpointKeys = Object.keys(breakpoints);
export const breakpointValues = Object.values(breakpoints);

export const useBreakpoint = (onChange?: (breakpoint: number) => void) => {
  const prevRef = useRef<number>(0);
  const [curBreakpoint, setBreakpoint] = useState<number>(
    getScreenBreakpoint()
  );

  const onResize = useCallback(() => {
    const breakpointIdx = getScreenBreakpoint();

    if (breakpointIdx >= 0 && prevRef.current !== breakpointIdx) {
      if (onChange) {
        onChange(breakpointIdx);
      } else {
        setBreakpoint(breakpointIdx);
      }
      prevRef.current = breakpointIdx;
    }
  }, [onChange]);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const breakpoint = breakpointKeys[curBreakpoint];

  return [curBreakpoint, breakpoint] as [number, Breakpoint];
};

export function getScreenBreakpoint() {
  const width = typeof window !== "undefined" ? window.innerWidth : 0;
  let breakpointIdx = breakpointValues.findIndex((i) => width <= i);
  if (breakpointIdx < 0) {
    breakpointIdx = breakpointKeys.length - 1;
  }

  return breakpointIdx;
}
