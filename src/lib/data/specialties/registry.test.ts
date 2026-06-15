import { describe, it, expect } from "vitest";

import { buildCategories } from "./common";
import { SPECIALTIES, getSpecialty, isSpecialtyReady, allMilestonesOf } from "./index";

describe("buildCategories", () => {
  it("prefixar delmåls-id med specialitets-id (ingen korsläckning)", () => {
    const cats = buildCategories("internmedicin", [1, 2, 3, 4], 13);
    const all = cats.flatMap((c) => c.milestones);
    // STa1 + STb1 + STc1 finns med prefixat id men oförändrad kort kod
    const stc1 = all.find((m) => m.shortTitle === "STc1")!;
    expect(stc1.id).toBe("internmedicin:stc1");
    expect(all.find((m) => m.shortTitle === "STa1")!.id).toBe("internmedicin:sta1");
  });

  it("ger olika id för samma kod i olika specialiteter", () => {
    const a = buildCategories("kirurgi", [1, 2, 3, 4], 14).flatMap((c) => c.milestones);
    const b = buildCategories("ortopedi", [1, 2, 3, 4], 14).flatMap((c) => c.milestones);
    const aStc5 = a.find((m) => m.shortTitle === "STc5")!.id;
    const bStc5 = b.find((m) => m.shortTitle === "STc5")!.id;
    expect(aStc5).not.toBe(bStc5);
  });

  it("bygger rätt antal delmål (STa7 + STb-delmängd + STc)", () => {
    const cats = buildCategories("internmedicin", [1, 2, 3, 4], 13);
    expect(cats.flatMap((c) => c.milestones)).toHaveLength(7 + 4 + 13);
  });

  it("utelämnar STb-kategorin när inga STb gäller", () => {
    const cats = buildCategories("klinisk-kemi", [], 13);
    expect(cats.find((c) => c.id === "b")).toBeUndefined();
    expect(cats.flatMap((c) => c.milestones)).toHaveLength(7 + 13);
  });
});

describe("SPECIALTIES-registret", () => {
  it("har unika id", () => {
    const ids = SPECIALTIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("har inga globalt krockande delmåls-id mellan specialiteter", () => {
    const seen = new Map<string, string>();
    for (const s of SPECIALTIES) {
      for (const m of allMilestonesOf(s)) {
        const owner = seen.get(m.id);
        expect(owner, `delmåls-id ${m.id} delas av ${owner} och ${s.id}`).toBeUndefined();
        seen.set(m.id, s.id);
      }
    }
  });

  it("är fullt inlagda (alla har delmål)", () => {
    for (const s of SPECIALTIES) {
      expect(isSpecialtyReady(s), `${s.name} saknar delmål`).toBe(true);
    }
  });

  it("har radiologi som standardspecialitet med egna kurerade titlar", () => {
    const r = getSpecialty("radiologi")!;
    expect(r.name).toBe("Radiologi");
    expect(allMilestonesOf(r).find((m) => m.id === "c5")?.title).toContain("Thorax");
  });
});
