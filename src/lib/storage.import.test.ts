import { describe, it, expect } from "vitest";

import {
  importFromJson,
  getBackupJson,
  getStoredVersion,
  setStoredVersion,
  runStartupMigration,
  readStorage,
  writeStorage,
  STORAGE_KEYS,
  APP_DATA_VERSION,
} from "./storage";

function backupJson(data: unknown, version = APP_DATA_VERSION) {
  return JSON.stringify({
    app: "st-radiologi",
    version,
    exportedAt: "2026-06-15T00:00:00Z",
    data,
  });
}

describe("importFromJson – lyckad import", () => {
  it("skriver alla sektioner och stämplar versionen", () => {
    importFromJson(
      backupJson({
        specialty: "radiologi",
        milestones: { c5: true },
        courses: [{ id: "k1", name: "Kurs", certificate: true, credits: { c5: 1 } }],
      }),
    );
    expect(readStorage(STORAGE_KEYS.specialty, null)).toBe("radiologi");
    expect(readStorage(STORAGE_KEYS.milestones, null)).toEqual({ c5: true });
    expect(getStoredVersion()).toBe(APP_DATA_VERSION);
  });

  it("bevarar data genom export → import (round-trip)", () => {
    writeStorage(STORAGE_KEYS.specialty, "radiologi");
    writeStorage(STORAGE_KEYS.milestones, { c5: true, c6: true });
    writeStorage(STORAGE_KEYS.courses, [
      { id: "k1", name: "Thorax", certificate: false, credits: { c5: 1 } },
    ]);
    const json = getBackupJson();

    // Rensa och importera tillbaka.
    localStorage.clear();
    importFromJson(json);

    expect(readStorage(STORAGE_KEYS.specialty, null)).toBe("radiologi");
    expect(readStorage(STORAGE_KEYS.milestones, null)).toEqual({ c5: true, c6: true });
    expect(readStorage<{ id: string }[]>(STORAGE_KEYS.courses, [])[0].id).toBe("k1");
  });
});

describe("importFromJson – avvisar och skriver inget (atomicitet)", () => {
  it("kastar vid ogiltig JSON utan att skriva", () => {
    expect(() => importFromJson("{ inte json")).toThrow(/giltig JSON/);
    expect(readStorage(STORAGE_KEYS.specialty, null)).toBeNull();
  });

  it("kastar vid fil från annan app", () => {
    expect(() => importFromJson(JSON.stringify({ app: "annat", version: 1, data: {} }))).toThrow(
      /den här appen/,
    );
  });

  it("lämnar befintlig data orörd när importen är trasig", () => {
    // Befintlig giltig placering.
    const existing = [
      { id: "e1", department: "Thorax", startDate: "2024-01-01", endDate: "2024-04-01", months: 3 },
    ];
    writeStorage(STORAGE_KEYS.schedule, existing);

    // Import med trasig placering (saknar id) ska kasta och INTE röra befintlig data.
    expect(() => importFromJson(backupJson({ schedule: [{ department: "Buk" }] }))).toThrow();

    expect(readStorage(STORAGE_KEYS.schedule, null)).toEqual(existing);
  });

  it("avvisar en backup som är nyare än appen", () => {
    expect(() =>
      importFromJson(backupJson({ specialty: "radiologi" }, APP_DATA_VERSION + 1)),
    ).toThrow(/nyare version/);
    expect(readStorage(STORAGE_KEYS.specialty, null)).toBeNull();
  });
});

describe("versionsstämpel & uppstartsmigrering", () => {
  it("getStoredVersion är null innan något stämplats", () => {
    expect(getStoredVersion()).toBeNull();
  });

  it("runStartupMigration stämplar aktuell version första gången", () => {
    runStartupMigration();
    expect(getStoredVersion()).toBe(APP_DATA_VERSION);
  });

  it("runStartupMigration är en no-op när versionen redan är aktuell", () => {
    setStoredVersion(APP_DATA_VERSION);
    runStartupMigration();
    expect(getStoredVersion()).toBe(APP_DATA_VERSION);
  });

  it("ignorerar ogiltig versionssträng", () => {
    localStorage.setItem("st-radiologi:__version__", "trasig");
    expect(getStoredVersion()).toBeNull();
  });
});
