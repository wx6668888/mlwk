// Lets a full-bleed hero tell the global nav what is behind it while the nav is transparent.
// "light" = light imagery behind the nav (ink text); "dark" = dark imagery (bone text).
import { useSyncExternalStore } from "react";

export type NavTone = "light" | "dark";

let tone: NavTone | null = null;
const listeners = new Set<() => void>();

export function setNavTone(next: NavTone | null) {
  if (next === tone) return;
  tone = next;
  listeners.forEach((fn) => fn());
}

export function useNavTone(): NavTone | null {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => tone,
    () => null,
  );
}
