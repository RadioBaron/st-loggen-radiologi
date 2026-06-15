import { describe, it, expect } from "vitest";

import { applyMigrations, CURRENT_DATA_VERSION, type Migration } from "./migrations";

describe("applyMigrations", () => {
  it("är en no-op när datan redan är aktuell", () => {
    const data = { a: 1, b: 2 };
    expect(applyMigrations(data, CURRENT_DATA_VERSION)).toEqual(data);
  });

  it("kör en injicerad kedja i ordning från v1 till v3", () => {
    const chain: Record<number, Migration> = {
      1: (d) => ({ ...d, steps: [...((d.steps as number[]) ?? []), 1] }),
      2: (d) => ({ ...d, steps: [...((d.steps as number[]) ?? []), 2] }),
    };
    const out = applyMigrations({}, 1, 3, chain);
    expect(out.steps).toEqual([1, 2]);
  });

  it("kastar när en migrering i kedjan saknas", () => {
    const chain: Record<number, Migration> = {
      1: (d) => d, // saknar 2 -> 3
    };
    expect(() => applyMigrations({}, 1, 3, chain)).toThrow(/Saknar migrering från version 2/);
  });

  it("kastar när datan är nyare än appen stödjer", () => {
    expect(() => applyMigrations({}, CURRENT_DATA_VERSION + 1)).toThrow(/nyare version/);
  });

  it("kastar vid ogiltig fromVersion", () => {
    expect(() => applyMigrations({}, 0)).toThrow(/Ogiltig dataversion/);
  });

  it("muterar inte ursprungsdatan", () => {
    const chain: Record<number, Migration> = {
      1: (d) => ({ ...d, extra: true }),
    };
    const original = { a: 1 };
    applyMigrations(original, 1, 2, chain);
    expect(original).toEqual({ a: 1 });
  });
});
