// Profil för ST-läkaren. Används i översikten och fylls automatiskt in i
// ansökningshjälpen (specialistbevis). Sparas lokalt som övriga data.

export type Profile = {
  name: string;
  specialty: string;
  region: string;
  clinic: string;
  licenseDate: string; // legitimationsdatum, YYYY-MM-DD
  startDate: string; // ST-start, YYYY-MM-DD
  supervisor: string; // huvudhandledare
  studyDirector: string; // studierektor
  headOfDept: string; // verksamhetschef
  goalMonths: number;
};

export const DEFAULT_PROFILE: Profile = {
  name: "",
  specialty: "Radiologi",
  region: "",
  clinic: "",
  licenseDate: "",
  startDate: "",
  supervisor: "",
  studyDirector: "",
  headOfDept: "",
  goalMonths: 60,
};
