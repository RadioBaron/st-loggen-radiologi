import { describe, it, expect } from "vitest";

import { genId, formatDate, stripMilestonePrefix, nf } from "./utils";

describe("genId", () => {
  it("ger unika id", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => genId()));
    expect(ids.size).toBe(1000);
  });
});

describe("formatDate", () => {
  it("returnerar tom sträng för tomt/ogiltigt", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate(null)).toBe("");
  });

  it("formaterar ett ISO-datum med år och dag", () => {
    const out = formatDate("2024-01-15");
    expect(out).toContain("2024");
    expect(out).toContain("15");
  });
});

describe("stripMilestonePrefix", () => {
  it("tar bort kodprefix med tankstreck", () => {
    expect(stripMilestonePrefix("c5 – Thoraxradiologi")).toBe("Thoraxradiologi");
    expect(stripMilestonePrefix("STa1 – Etik")).toBe("Etik");
  });

  it("lämnar bara-kod oförändrad", () => {
    expect(stripMilestonePrefix("STc1")).toBe("STc1");
  });
});

describe("nf", () => {
  it("använder svensk decimalkomma", () => {
    expect(nf(0.5)).toBe("0,5");
  });
});
