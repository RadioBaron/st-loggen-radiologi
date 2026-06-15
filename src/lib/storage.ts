// Local storage layer for the ST Radiology notebook.
// All data is persisted to localStorage and can be exported/imported as JSON
// so the user can back it up to Google Drive, OneDrive, or anywhere else.

import { useEffect, useState, useCallback, useRef } from "react";

import { CURRENT_DATA_VERSION, applyMigrations, type DataBundle } from "@/lib/migrations";
import { validateBackup } from "@/lib/data/validation";

const STORAGE_PREFIX = "st-radiologi:";
// Versionen på datamodellen. Exporteras för bakåtkompatibilitet men hålls i
// synk med migreringsramverkets CURRENT_DATA_VERSION (enda källan).
export const APP_DATA_VERSION = CURRENT_DATA_VERSION;

// Nyckel där den lokala datans schemaversion stämplas (utanför STORAGE_KEYS,
// alltså inte en del av backupen – backupen bär sin egen version i envelopen).
const VERSION_KEY = "__version__";

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

  // Spegla alltid senaste värdet i en ref. Det gör att update() kan beräkna
  // nästa värde utan att lägga sidoeffekter (writeStorage/notify) i Reacts
  // state-updater – en sådan updater körs två gånger i StrictMode och skulle
  // då skapa dubbletter (t.ex. två placeringar/kurser av ett klick).
  const valueRef = useRef(value);
  valueRef.current = value;

  // hydrate after mount to keep SSR happy
  useEffect(() => {
    const sync = () => {
      const next = readStorage<T>(key, initial);
      valueRef.current = next;
      setValue(next);
    };
    sync();
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(sync);
    return () => {
      listeners.get(key)?.delete(sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(valueRef.current) : next;
      valueRef.current = resolved;
      setValue(resolved);
      writeStorage(key, resolved); // persisterar + notifierar andra prenumeranter
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

// ---- Versionsstämpel & migrering --------------------------------------

/** Läser den lokala datans schemaversion, eller null om den aldrig stämplats. */
export function getStoredVersion(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_PREFIX + VERSION_KEY);
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function setStoredVersion(version: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PREFIX + VERSION_KEY, String(version));
}

/** Samlar all lagrad data till en bunt (lagringsnyckel -> värde). */
function readBundle(): DataBundle {
  const bundle: DataBundle = {};
  for (const [k, storageKey] of Object.entries(STORAGE_KEYS)) {
    bundle[k] = readStorage(storageKey, null);
  }
  return bundle;
}

/** Skriver tillbaka en (validerad/migrerad) bunt. Hoppar över tomma nycklar. */
function writeBundle(bundle: DataBundle) {
  for (const [k, storageKey] of Object.entries(STORAGE_KEYS)) {
    const value = bundle[k];
    if (value !== undefined && value !== null) {
      writeStorage(storageKey, value);
    }
  }
}

/**
 * Körs en gång vid uppstart. Stämplar versionen första gången, och migrerar
 * äldre data framåt vid behov. Är en no-op när datan redan är aktuell.
 */
export function runStartupMigration() {
  if (typeof window === "undefined") return;
  const stored = getStoredVersion();

  // Första gången versionsstämpeln införs: befintlig data har redan aktuell
  // form (vi är på v1), så stämpla utan att migrera.
  if (stored === null) {
    setStoredVersion(CURRENT_DATA_VERSION);
    return;
  }

  if (stored === CURRENT_DATA_VERSION) return;

  if (stored > CURRENT_DATA_VERSION) {
    // Datan är från en nyare app – migrera inte (kan inte nedgradera säkert).
    console.warn(
      `Lokala data är version ${stored} men appen är version ${CURRENT_DATA_VERSION}. Uppdatera appen.`,
    );
    return;
  }

  // stored < CURRENT: migrera framåt och skriv tillbaka.
  const migrated = applyMigrations(readBundle(), stored);
  writeBundle(migrated);
  setStoredVersion(CURRENT_DATA_VERSION);
}

// ---- Backup-export / import -------------------------------------------

// Bygg backup-payloaden som en JSON-sträng (används av fil-export och Drive).
export function getBackupJson(): string {
  const payload = {
    app: "st-radiologi",
    version: CURRENT_DATA_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(
      Object.entries(STORAGE_KEYS).map(([k, storageKey]) => [k, readStorage(storageKey, null)]),
    ),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Läser in en backup från en JSON-sträng. Atomisk och säker:
 *   1. Tolka JSON.
 *   2. Validera hela innehållet (zod) – kastar vid skräp/fel app.
 *   3. Migrera om backupen är äldre; avvisa om den är nyare.
 *   4. Skriv ALLT först efter att allt validerats (inget halvskrivet).
 */
export function importFromJson(text: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Filen är inte giltig JSON.");
  }

  // Validera (kastar med tydligt meddelande vid fel).
  const { version, data } = validateBackup(parsed);

  // Migrera vid behov (kastar om backupen är nyare än appen).
  const migrated = applyMigrations(data as DataBundle, version);

  // Allt är validerat och migrerat – skriv nu (atomiskt ur användarens vy).
  writeBundle(migrated);
  setStoredVersion(CURRENT_DATA_VERSION);
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
