// Local storage layer for the ST Radiology notebook.
// All data is persisted to localStorage and can be exported/imported as JSON
// so the user can back it up to Google Drive, OneDrive, or anywhere else.

import { useEffect, useState, useCallback } from "react";

const STORAGE_PREFIX = "st-radiologi:";
export const APP_DATA_VERSION = 1;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  notify(key);
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  // hydrate after mount to keep SSR happy
  useEffect(() => {
    setValue(readStorage<T>(key, initial));
    const listener = () => setValue(readStorage<T>(key, initial));
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => {
      listeners.get(key)?.delete(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}

// ---- Export / Import ---------------------------------------------------

export const STORAGE_KEYS = {
  specialty: "specialty",
  milestones: "milestones",
  schedule: "schedule",
  supervision: "supervision",
  courses: "courses",
  profile: "profile",
  application: "application",
} as const;

// Bygg backup-payloaden som en JSON-sträng (används av fil-export och Drive).
export function getBackupJson(): string {
  const payload = {
    app: "st-radiologi",
    version: APP_DATA_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(
      Object.entries(STORAGE_KEYS).map(([k, storageKey]) => [
        k,
        readStorage(storageKey, null),
      ]),
    ),
  };
  return JSON.stringify(payload, null, 2);
}

// Läs in en backup-payload från en JSON-sträng.
export function importFromJson(text: string) {
  const parsed = JSON.parse(text);
  if (parsed.app !== "st-radiologi") {
    throw new Error("Filen verkar inte komma från denna app.");
  }
  const data = parsed.data ?? {};
  for (const [k, storageKey] of Object.entries(STORAGE_KEYS)) {
    if (data[k] !== undefined && data[k] !== null) {
      writeStorage(storageKey, data[k]);
    }
  }
}

export function exportAllData() {
  const blob = new Blob([getBackupJson()], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `st-radiologi-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importAllData(file: File) {
  importFromJson(await file.text());
}
