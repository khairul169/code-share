import { useState } from "react";
import {
  Breakpoint,
  breakpointKeys,
  getScreenBreakpoint,
  useBreakpoint,
} from "./useBreakpoint";

export type BreakpointValues<T> = Partial<Record<Breakpoint, T | null>>;

export const useBreakpointValue = <T>(values: T | BreakpointValues<T>) => {
  const [value, setValue] = useState(
    typeof values === "object"
      ? getValueByBreakpoint(
          values as BreakpointValues<T>,
          getScreenBreakpoint()
        )
      : values
  );

  useBreakpoint((breakpoint) => {
    if (typeof values !== "object") {
      return;
    }

    const newValue = getValueByBreakpoint(
      values as BreakpointValues<T>,
      breakpoint
    );

    if (newValue !== value) {
      setValue(newValue);
    }
  });

  return value as T;
};

export function getValueByBreakpoint<T>(
  values: BreakpointValues<T>,
  breakpoint: number
) {
  const valueEntries = Object.entries(values as never);

  let resIdx = valueEntries.findIndex(([key]) => {
    const bpIdx = breakpointKeys.indexOf(key);
    return breakpoint <= bpIdx;
  });
  if (resIdx < 0) {
    resIdx = valueEntries.length - 1;
  }

  const value = valueEntries[resIdx]?.[1] as T;
  return value;
}
