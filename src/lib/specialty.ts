// Hook för den aktiva specialiteten. Den valda specialitetens id sparas lokalt
// och styr vilka delmål, kategorier och placeringar appen visar. Allt innehåll
// hänger på den här valda specialiteten – byt specialitet och hela appen följer.

import { useMemo } from "react";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import {
  SPECIALTIES,
  getSpecialty,
  type Specialty,
  type Milestone,
  type MilestoneCategory,
  allMilestonesOf,
  isSpecialtyReady,
} from "@/lib/data/specialties";

export type ActiveSpecialty = {
  /** Det sparade specialitets-id:t (tom sträng = inget valt ännu). */
  specialtyId: string;
  /** Sätt vald specialitet. */
  setSpecialtyId: (id: string) => void;
  /** True när användaren ännu inte valt någon specialitet. */
  needsOnboarding: boolean;
  /** Den valda specialiteten (eller undefined om inget/okänt valts). */
  specialty: Specialty | undefined;
  categories: MilestoneCategory[];
  allMilestones: Milestone[];
  /** Standardlängd för vald specialitet (månader). */
  goalMonths: number;
};

export function useActiveSpecialty(): ActiveSpecialty {
  const [specialtyId, setSpecialtyId] = useLocalState<string>(STORAGE_KEYS.specialty, "");

  return useMemo(() => {
    const specialty = getSpecialty(specialtyId);
    const ready = specialty && isSpecialtyReady(specialty) ? specialty : undefined;
    return {
      specialtyId,
      setSpecialtyId,
      needsOnboarding: !ready,
      specialty,
      categories: ready?.categories ?? [],
      allMilestones: ready ? allMilestonesOf(ready) : [],
      goalMonths: specialty?.goalMonths ?? 60,
    };
  }, [specialtyId, setSpecialtyId]);
}

/** Alla specialiteter (för väljaren). */
export { SPECIALTIES };
