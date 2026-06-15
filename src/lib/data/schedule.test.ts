import { describe, it, expect } from "vitest";

import {
  monthsBetween,
  countsTowardService,
  countedMonths,
  departmentOptions,
  entryStart,
  scheduleDisplayName,
  type ScheduleEntry,
} from "./schedule";

function entry(p: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    id: p.id ?? "x",
    department: p.department ?? "Thorax",
    startDate: p.startDate ?? "2024-01-01",
    endDate: p.endDate ?? "2024-04-01",
    months: p.months ?? 3,
    ...p,
  };
}

describe("monthsBetween", () => {
  it("räknar ut hela månader", () => {
    // 2024 är skottår: jan+feb+mar = 91 dagar ≈ 3 månader
    expect(monthsBetween("2024-01-01", "2024-04-01")).toBe(3);
  });

  it("ger 0 för slut före start", () => {
    expect(monthsBetween("2024-04-01", "2024-01-01")).toBe(0);
  });

  it("ger 0 för ogiltiga datum", () => {
    expect(monthsBetween("", "")).toBe(0);
    expect(monthsBetween("inte-datum", "2024-01-01")).toBe(0);
  });
});

describe("countsTowardService", () => {
  it("räknar klinisk placering men inte föräldraledighet", () => {
    expect(countsTowardService(entry({ department: "Thorax" }))).toBe(true);
    expect(countsTowardService(entry({ department: "Föräldraledig" }))).toBe(false);
  });
});

describe("countedMonths", () => {
  it("exkluderar icke-räknande placeringar", () => {
    const total = countedMonths([
      entry({ department: "Thorax", months: 6 }),
      entry({ department: "Föräldraledig", months: 12 }),
      entry({ department: "Abdomen", months: 4 }),
    ]);
    expect(total).toBe(10);
  });
});

describe("departmentOptions", () => {
  it("sätter specialitetens placeringar först och avdubblar gemensamma", () => {
    const opts = departmentOptions(["Thorax", "Forskning"]);
    expect(opts[0]).toBe("Thorax");
    // "Forskning" finns både i specialiteten och bland de gemensamma – ska bara med en gång
    expect(opts.filter((d) => d === "Forskning")).toHaveLength(1);
    // special-kategorierna ska alltid med
    expect(opts).toContain("Föräldraledig");
    expect(opts).toContain("Övrigt");
  });

  it("fungerar utan specialitetsplaceringar", () => {
    const opts = departmentOptions(undefined);
    expect(opts).toContain("Sidotjänstgöring");
    expect(opts).toContain("Övrigt");
  });
});

describe("entryStart", () => {
  it("faller tillbaka på startMonth för äldre poster", () => {
    expect(entryStart(entry({ startDate: "", startMonth: "2023-09" }))).toBe("2023-09-01");
  });
});

describe("scheduleDisplayName", () => {
  it("visar egen text för Övrigt", () => {
    expect(scheduleDisplayName(entry({ department: "Övrigt", customName: "Akutmottagning" }))).toBe(
      "Akutmottagning",
    );
  });
  it("visar placeringens namn annars", () => {
    expect(scheduleDisplayName(entry({ department: "Neuro" }))).toBe("Neuro");
  });
});
