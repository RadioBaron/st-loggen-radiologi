// Specialitetsövergripande delmål enligt HSLF-FS 2021:8. STa1–STa7 gäller alla
// specialiteter. STb1–STb4 gäller de flesta (vilka som är tillämpliga varierar
// per specialitet – se respektive specialitets `stb`-lista). Titlarna är hämtade
// direkt ur föreskriftens målbeskrivningar och är identiska för alla specialiteter.

import type { Milestone, MilestoneCategory } from "./types";

const STA_TITLES: Record<number, string> = {
  1: "Hälso- och sjukvårdens förutsättningar",
  2: "Systematiskt kvalitets- och patientsäkerhetsarbete",
  3: "Medicinsk vetenskap",
  4: "Etik",
  5: "Ledarskap",
  6: "Lärande",
  7: "Vårdhygien och smittskydd",
};

const STB_TITLES: Record<number, string> = {
  1: "Kommunikation med patienter och närstående",
  2: "Sjukdomsförebyggande och hälsofrämjande arbete",
  3: "Försäkringsmedicin",
  4: "Palliativ vård",
};

function milestone(prefix: "a" | "b" | "c", n: number, title?: string): Milestone {
  const code = `ST${prefix}${n}`;
  return {
    id: `st${prefix}${n}`,
    shortTitle: code,
    title: title ? `${code} – ${title}` : code,
  };
}

/** STa1–STa7 (samma för alla specialiteter). */
export const STA_MILESTONES: Milestone[] = Object.keys(STA_TITLES)
  .map(Number)
  .sort((a, b) => a - b)
  .map((n) => milestone("a", n, STA_TITLES[n]));

/** Bygger STb-delmål för de nummer som är tillämpliga för specialiteten. */
export function stbMilestones(nums: number[]): Milestone[] {
  return [...nums].sort((a, b) => a - b).map((n) => milestone("b", n, STB_TITLES[n]));
}

/** Bygger STc1…N (specialitetsspecifika; föreskriften ger inga titlar). */
export function stcMilestones(count: number): Milestone[] {
  return Array.from({ length: count }, (_, i) => milestone("c", i + 1));
}

/**
 * Sätter ihop kategorierna för en specialitet utifrån STb-delmängd och antal STc.
 * STa-kategorin är alltid med; STb tas med om minst ett delmål gäller.
 */
export function buildCategories(stbNums: number[], stcCount: number): MilestoneCategory[] {
  const categories: MilestoneCategory[] = [
    {
      id: "a",
      title: "STa – Specialitetsövergripande kompetenser",
      description: "Gemensamma kompetenser som gäller för alla specialiteter.",
      milestones: STA_MILESTONES,
    },
  ];

  const stb = stbMilestones(stbNums);
  if (stb.length > 0) {
    categories.push({
      id: "b",
      title: "STb – Kommunikation, hälsa, försäkring och palliativ vård",
      description: "Specialitetsövergripande delmål som är tillämpliga för specialiteten.",
      milestones: stb,
    });
  }

  if (stcCount > 0) {
    categories.push({
      id: "c",
      title: "STc – Specialitetsspecifika kompetenser",
      description:
        "Delmål specifika för specialiteten. Föreskriften numrerar dem (STc1…N) utan korta titlar.",
      milestones: stcMilestones(stcCount),
    });
  }

  return categories;
}
