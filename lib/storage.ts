"use client";

import type { Category } from "./iq/types";
import type { LikertValue, Trait } from "./personality/types";

const STORAGE_KEY = "modulo-test:v1";
export const STORAGE_VERSION = 1;

export interface StoredCategoryResult {
  category: Category;
  correct: number;
  total: number;
  accuracy: number;
  score: number | null;
}

export interface StoredIqAttempt {
  id: string;
  testId: string;
  testName: string;
  completedAt: number;
  durationSec: number;
  iq: number;
  low: number;
  high: number;
  /** Standard error of the estimate, in IQ points. */
  standardError?: number;
  percentile: number;
  band: string;
  correct: number;
  total: number;
  accuracy: number;
  noveltyRatio: number;
  categoryCount: number;
  categories: StoredCategoryResult[];
  questionIds: string[];
  responses: Record<string, number | null>;
}

export interface StoredPersonalityResult {
  id: string;
  completedAt: number;
  /** Which form was taken; results are re-scored from `responses` on display. */
  form?: string;
  qualityLevel?: string;
  /** Reported confidence in the reading, 0-100, with its plus-or-minus band. */
  confidencePercent?: number;
  confidenceMargin?: number;
  /** Which of the four energies led. */
  dominant?: string;
  traitScores: Record<Trait, number>;
  primaryId: string;
  primaryMatch: number;
  secondaryId: string;
  secondaryMatch: number;
  answered: number;
  total: number;
  /** Retired statement answers, kept so profiles saved by older versions still parse. */
  responses?: Record<string, LikertValue>;
  scenarioChoices?: Record<string, string>;
  aspirationChoices?: Record<string, "left" | "right">;
}

export interface ActiveIqSession {
  testId: string;
  seed: number;
  questionIds: string[];
  responses: Record<string, number | null>;
  index: number;
  startedAt: number;
  /** Epoch ms at which a timed test auto-submits; null when untimed. */
  expiresAt: number | null;
  noveltyRatio: number;
}

export interface ActivePersonalitySession {
  form: string;
  responses?: Record<string, LikertValue>;
  scenarioChoices: Record<string, string>;
  aspirationChoices: Record<string, "left" | "right">;
  section: string;
  index: number;
  startedAt: number;
}

export interface ModuloStore {
  version: number;
  attempts: StoredIqAttempt[];
  personality: StoredPersonalityResult[];
  /** questionId -> number of times it has been served. */
  seen: Record<string, number>;
  activeIq: ActiveIqSession | null;
  activePersonality: ActivePersonalitySession | null;
}

export const EMPTY_STORE: ModuloStore = {
  version: STORAGE_VERSION,
  attempts: [],
  personality: [],
  seen: {},
  activeIq: null,
  activePersonality: null,
};

const listeners = new Set<() => void>();
let cache: ModuloStore | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function coerce(raw: unknown): ModuloStore {
  if (!raw || typeof raw !== "object") return { ...EMPTY_STORE };
  const value = raw as Partial<ModuloStore>;
  return {
    version: STORAGE_VERSION,
    attempts: Array.isArray(value.attempts) ? value.attempts.filter(isAttempt) : [],
    personality: Array.isArray(value.personality)
      ? value.personality.filter(isPersonality)
      : [],
    seen:
      value.seen && typeof value.seen === "object"
        ? Object.fromEntries(
            Object.entries(value.seen).filter(
              (entry): entry is [string, number] => typeof entry[1] === "number",
            ),
          )
        : {},
    activeIq: isActiveIq(value.activeIq) ? value.activeIq : null,
    activePersonality: isActivePersonality(value.activePersonality)
      ? value.activePersonality
      : null,
  };
}

function isAttempt(value: unknown): value is StoredIqAttempt {
  const a = value as StoredIqAttempt | null;
  return (
    !!a &&
    typeof a.id === "string" &&
    typeof a.testId === "string" &&
    typeof a.iq === "number" &&
    Number.isFinite(a.iq) &&
    typeof a.completedAt === "number" &&
    Array.isArray(a.categories)
  );
}

function isPersonality(value: unknown): value is StoredPersonalityResult {
  const p = value as StoredPersonalityResult | null;
  return (
    !!p &&
    typeof p.id === "string" &&
    typeof p.completedAt === "number" &&
    typeof p.primaryId === "string" &&
    !!p.traitScores &&
    typeof p.traitScores === "object"
  );
}

function isActiveIq(value: unknown): value is ActiveIqSession {
  const s = value as ActiveIqSession | null;
  return (
    !!s &&
    typeof s.testId === "string" &&
    Array.isArray(s.questionIds) &&
    s.questionIds.length > 0 &&
    !!s.responses &&
    typeof s.responses === "object"
  );
}

function isActivePersonality(value: unknown): value is ActivePersonalitySession {
  const s = value as ActivePersonalitySession | null;
  return (
    !!s &&
    !!s.responses &&
    typeof s.responses === "object" &&
    typeof s.form === "string"
  );
}

export function loadStore(): ModuloStore {
  if (cache) return cache;
  if (!isBrowser()) return EMPTY_STORE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? coerce(JSON.parse(raw)) : { ...EMPTY_STORE };
  } catch {
    // Corrupt or unavailable storage must never break the app.
    cache = { ...EMPTY_STORE };
  }
  return cache;
}

function write(next: ModuloStore) {
  cache = next;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota or private-mode failure: keep the in-memory copy and carry on.
    }
  }
  for (const listener of listeners) listener();
}

export function updateStore(mutate: (store: ModuloStore) => ModuloStore): ModuloStore {
  const next = mutate(loadStore());
  write(next);
  return next;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Snapshot identity is stable between writes, as useSyncExternalStore requires. */
export function getSnapshot(): ModuloStore {
  return loadStore();
}

export function getServerSnapshot(): ModuloStore {
  return EMPTY_STORE;
}

export function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

/* ---------------------------------------------------------------- mutations */

export function markSeen(questionIds: readonly string[]): void {
  updateStore((store) => {
    const seen = { ...store.seen };
    for (const id of questionIds) seen[id] = (seen[id] ?? 0) + 1;
    return { ...store, seen };
  });
}

export function saveActiveIq(session: ActiveIqSession | null): void {
  updateStore((store) => ({ ...store, activeIq: session }));
}

export function saveActivePersonality(session: ActivePersonalitySession | null): void {
  updateStore((store) => ({ ...store, activePersonality: session }));
}

export function addAttempt(attempt: StoredIqAttempt): void {
  updateStore((store) => ({
    ...store,
    attempts: [...store.attempts, attempt],
    activeIq: null,
  }));
}

export function addPersonalityResult(result: StoredPersonalityResult): void {
  updateStore((store) => ({
    ...store,
    personality: [...store.personality, result],
    activePersonality: null,
  }));
}

export function deleteAttempt(id: string): void {
  updateStore((store) => ({
    ...store,
    attempts: store.attempts.filter((a) => a.id !== id),
  }));
}

export function deletePersonalityResult(id: string): void {
  updateStore((store) => ({
    ...store,
    personality: store.personality.filter((p) => p.id !== id),
  }));
}

export function clearIqHistory(): void {
  updateStore((store) => ({ ...store, attempts: [], activeIq: null }));
}

export function clearPersonalityHistory(): void {
  updateStore((store) => ({ ...store, personality: [], activePersonality: null }));
}

/** Forget which questions have been served, so retakes draw from the full bank. */
export function clearSeenQuestions(): void {
  updateStore((store) => ({ ...store, seen: {} }));
}

export function clearEverything(): void {
  write({ ...EMPTY_STORE, seen: {} });
}
