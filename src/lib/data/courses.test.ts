import { describe, it, expect } from "vitest";

import {
  earnedByMilestone,
  creditedMilestoneIds,
  courseLinksByMilestone,
  type Course,
} from "./courses";

function course(p: Partial<Course>): Course {
  return {
    id: p.id ?? "c1",
    name: p.name ?? "Kurs",
    date: p.date ?? "2024-01-01",
    certificate: p.certificate ?? false,
    credits: p.credits ?? {},
    ...p,
  };
}

describe("earnedByMilestone", () => {
  it("summerar poäng per delmål över flera kurser", () => {
    const map = earnedByMilestone([
      course({ id: "a", credits: { c5: 1, c6: 0.5 } }),
      course({ id: "b", credits: { c5: 0.5 } }),
    ]);
    expect(map).toEqual({ c5: 1.5, c6: 0.5 });
  });
});

describe("creditedMilestoneIds", () => {
  it("tar bara med delmål med positiva poäng", () => {
    expect(creditedMilestoneIds(course({ credits: { c5: 1, c6: 0, c7: 0.5 } }))).toEqual([
      "c5",
      "c7",
    ]);
  });
});

describe("courseLinksByMilestone", () => {
  it("indexerar kurser per delmål", () => {
    const links = courseLinksByMilestone([
      course({ id: "k1", name: "Thorax", credits: { c5: 1 } }),
      course({ id: "k2", name: "Buk", credits: { c5: 0.5, c6: 1 } }),
    ]);
    expect(links.c5).toHaveLength(2);
    expect(links.c5.map((l) => l.id)).toEqual(["k1", "k2"]);
    expect(links.c6).toHaveLength(1);
    expect(links.c6[0].points).toBe(1);
  });
});
