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

// VIKTIGT: delmåls-id prefixas med specialitetens id. Avbockade delmål och
// kurskopplingar lagras globalt per delmåls-id, så utan prefix skulle t.ex.
// "stc5" delas mellan alla specialiteter och avbockningar/kurser läcka mellan
// dem. shortTitle (det som visas) är fortfarande den korta koden, t.ex. "STc5".
function milestone(
  specialtyId: string,
  prefix: "a" | "b" | "c",
  n: number,
  title?: string,
): Milestone {
  const code = `ST${prefix}${n}`;
  return {
    id: `${specialtyId}:st${prefix}${n}`,
    shortTitle: code,
    title: title ? `${code} – ${title}` : code,
  };
}

/** STa1–STa7 för en specialitet (titlarna är gemensamma; id:t är prefixat). */
export function staMilestones(specialtyId: string): Milestone[] {
  return Object.keys(STA_TITLES)
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => milestone(specialtyId, "a", n, STA_TITLES[n]));
}

/** Bygger STb-delmål för de nummer som är tillämpliga för specialiteten. */
export function stbMilestones(specialtyId: string, nums: number[]): Milestone[] {
  return [...nums].sort((a, b) => a - b).map((n) => milestone(specialtyId, "b", n, STB_TITLES[n]));
}

/** Bygger STc1…N (specialitetsspecifika; föreskriften ger inga korta titlar). */
export function stcMilestones(specialtyId: string, count: number): Milestone[] {
  return Array.from({ length: count }, (_, i) =>
    milestone(specialtyId, "c", i + 1, `Specialitetsspecifikt delmål ${i + 1}`),
  );
}

/**
 * Sätter ihop kategorierna för en specialitet utifrån STb-delmängd och antal STc.
 * STa-kategorin är alltid med; STb tas med om minst ett delmål gäller.
 */
export function buildCategories(
  specialtyId: string,
  stbNums: number[],
  stcCount: number,
): MilestoneCategory[] {
  const categories: MilestoneCategory[] = [
    {
      id: "a",
      title: "STa – Specialitetsövergripande kompetenser",
      description: "Gemensamma kompetenser som gäller för alla specialiteter.",
      milestones: staMilestones(specialtyId),
    },
  ];

  const stb = stbMilestones(specialtyId, stbNums);
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
      milestones: stcMilestones(specialtyId, stcCount),
    });
  }

  return categories;
}
