// Lets a full-screen hero ask the global nav to step aside. While auto-hide is on, the nav stays out of
// view and comes back when the pointer reaches the top edge (desktop) or the visitor scrolls up (touch).
import { useSyncExternalStore } from "react";

let autoHide = false;
const listeners = new Set<() => void>();

export function setNavAutoHide(next: boolean) {
  if (next === autoHide) return;
  autoHide = next;
  listeners.forEach((fn) => fn());
}

export function useNavAutoHide(): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => autoHide,
    () => false,
  );
}
