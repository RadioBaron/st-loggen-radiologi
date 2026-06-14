// Mall för handledarsamtal. Varje session sparas separat med datum,
// handledare och svar per fråga.

export type SupervisionQuestion = {
  id: string;
  question: string;
  hint?: string;
};

export type SupervisionSection = {
  id: string;
  title: string;
  questions: SupervisionQuestion[];
};

export type SupervisionSession = {
  id: string;
  date: string; // YYYY-MM-DD
  supervisor: string;
  location?: string;
  /** key: `${sectionId}:${questionId}` */
  answers: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export const SUPERVISION_TEMPLATE: SupervisionSection[] = [
  {
    id: "tillbakablick",
    title: "Tillbakablick sedan förra samtalet",
    questions: [
      { id: "1", question: "Vilka placeringar och uppdrag har du haft sedan senaste samtalet?" },
      { id: "2", question: "Vilka delmål har du arbetat med, och vad har du uppnått?" },
      { id: "3", question: "Vilka kurser, konferenser eller fortbildningar har du genomfört?" },
    ],
  },
  {
    id: "klinisk-utveckling",
    title: "Klinisk utveckling",
    questions: [
      { id: "1", question: "Vilka modaliteter/områden känner du dig trygg i?" },
      { id: "2", question: "Var ser du dina största utvecklingsbehov just nu?" },
      { id: "3", question: "Hur går det med jourtjänstgöringen?", hint: "Volym, trygghet, stöd." },
    ],
  },
  {
    id: "vetenskap-kvalitet",
    title: "Vetenskap, kvalitet och utbildning",
    questions: [
      { id: "1", question: "Hur fortskrider ditt vetenskapliga arbete?" },
      { id: "2", question: "Har du deltagit i kvalitets- eller förbättringsarbete?" },
      { id: "3", question: "Har du undervisat AT/ST/studenter sedan förra samtalet?" },
    ],
  },
  {
    id: "arbetsmiljo",
    title: "Arbetsmiljö och välmående",
    questions: [
      { id: "1", question: "Hur upplever du din arbetsbelastning?" },
      { id: "2", question: "Finns det något som påverkar din utbildning negativt?" },
      { id: "3", question: "Hur ser balansen mellan jobb och fritid ut?" },
    ],
  },
  {
    id: "plan-framat",
    title: "Plan framåt",
    questions: [
      { id: "1", question: "Vilka delmål prioriteras till nästa samtal?" },
      { id: "2", question: "Vilka placeringar/kurser är planerade?" },
      { id: "3", question: "Konkreta åtgärder och vem ansvarar för vad?" },
    ],
  },
];
