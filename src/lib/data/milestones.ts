// Delmål för ST Radiologi enligt HSLF-FS 2021:8 + målbeskrivning radiologi.
// För radiologi gäller delmålen a1–a6, b1, b3 samt c1–c13.
//
// OBS: Socialstyrelsen anger inga numeriska "poäng" per delmål — varje delmål
// ska uppfyllas (klar/ej klar). Kurser kan ändå taggas med 0,5 eller 1 poäng
// per delmål för att hålla koll på hur mycket kursunderlag man samlat, men det
// finns inget fast poängkrav.

export type Milestone = {
  id: string;
  title: string;
  shortTitle: string;
};

export type MilestoneCategory = {
  id: string;
  title: string;
  description?: string;
  milestones: Milestone[];
};

export const DEFAULT_MILESTONES: MilestoneCategory[] = [
  {
    id: "a",
    title: "Delmål a – Gemensamma kompetenser",
    description: "Medarbetarskap, etik, vårdhygien, kvalitet, vetenskap, lagar.",
    milestones: [
      { id: "a1", shortTitle: "a1", title: "a1 – Medarbetarskap, ledarskap och pedagogik" },
      { id: "a2", shortTitle: "a2", title: "a2 – Etik, mångfald och jämlikhet" },
      { id: "a3", shortTitle: "a3", title: "a3 – Vårdhygien och smittskydd" },
      { id: "a4", shortTitle: "a4", title: "a4 – Systematiskt kvalitets- och patientsäkerhetsarbete" },
      { id: "a5", shortTitle: "a5", title: "a5 – Medicinsk vetenskap" },
      { id: "a6", shortTitle: "a6", title: "a6 – Lagar och andra föreskrifter samt hälso- och sjukvårdens organisation" },
    ],
  },
  {
    id: "b",
    title: "Delmål b – Kommunikation & läkemedel",
    description: "För radiologi gäller delmålen b1 och b3.",
    milestones: [
      { id: "b1", shortTitle: "b1", title: "b1 – Kommunikation med patienter och närstående" },
      { id: "b3", shortTitle: "b3", title: "b3 – Läkemedel" },
    ],
  },
  {
    id: "c",
    title: "Delmål c – Specialitetsspecifika kompetenser (radiologi)",
    description: "Delmålen c1–c4 utgör den gemensamma kunskapsbasen för radiologi och klinisk fysiologi.",
    milestones: [
      { id: "c1", shortTitle: "c1", title: "c1 – Undersökningsresultat och undersökningsmetoder" },
      { id: "c2", shortTitle: "c2", title: "c2 – Anatomi, fysiologi och patofysiologi med relevans för radiologin" },
      { id: "c3", shortTitle: "c3", title: "c3 – Fysik, teknik och bildbearbetning" },
      { id: "c4", shortTitle: "c4", title: "c4 – Nuklearmedicin med relevans för radiologin" },
      { id: "c5", shortTitle: "c5", title: "c5 – Thoraxradiologi" },
      { id: "c6", shortTitle: "c6", title: "c6 – Gastrointestinal radiologi (abdomen)" },
      { id: "c7", shortTitle: "c7", title: "c7 – Interventionell radiologi" },
      { id: "c8", shortTitle: "c8", title: "c8 – Muskuloskeletal radiologi (MSK)" },
      { id: "c9", shortTitle: "c9", title: "c9 – Neuroradiologi" },
      { id: "c10", shortTitle: "c10", title: "c10 – Barnradiologi" },
      { id: "c11", shortTitle: "c11", title: "c11 – Mammografi och bröstdiagnostik" },
      { id: "c12", shortTitle: "c12", title: "c12 – Urogenital radiologi" },
      { id: "c13", shortTitle: "c13", title: "c13 – Tillämpa lagar och föreskrifter inom kompetensområdet" },
    ],
  },
];

export const ALL_MILESTONES: Milestone[] = DEFAULT_MILESTONES.flatMap(
  (c) => c.milestones,
);
