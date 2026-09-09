"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe, type ModuloStore } from "./storage";

/** Reads the browser-local store and re-renders on every mutation. */
export function useStore(): ModuloStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
