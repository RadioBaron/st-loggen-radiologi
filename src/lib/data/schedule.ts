// Domänmodell för långtidsschemat (tjänstgöringsplaceringar).
// Typer och hjälpare bor här så att både schemasidan, statistiken och
// ansökningssammanställningen kan dela på dem utan att importera från routes.

export type ScheduleEntry = {
  id: string;
  department: string;
  /** Egen text när department === "Övrigt". */
  customName?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  months: number; // beräknas från datumen
  notes?: string;
  /** Bakåtkompatibelt: äldre poster sparade per månad. */
  startMonth?: string;
};

// Placeringar som alltid är valbara oavsett specialitet.
export const COMMON_DEPARTMENTS = ["Sidotjänstgöring", "Forskning"];
export const SPECIAL_DEPARTMENTS = ["Föräldraledig", "Övrigt"];

// Kategorier som inte räknas som ST-tjänstgöring mot måltiden.
export const NON_COUNTING_CATEGORIES = ["Föräldraledig"];

export function countsTowardService(e: ScheduleEntry): boolean {
  return !NON_COUNTING_CATEGORIES.includes(e.department);
}

/**
 * Bygger valbara placeringar för en specialitet: specialitetens egna
 * placeringar + gemensamma + special (föräldraledig, övrigt). Dubbletter rensas.
 */
export function departmentOptions(specialtyDepartments?: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const d of [
    ...(specialtyDepartments ?? []),
    ...COMMON_DEPARTMENTS,
    ...SPECIAL_DEPARTMENTS,
  ]) {
    if (!seen.has(d)) {
      seen.add(d);
      out.push(d);
    }
  }
  return out;
}

/** Antal månader mellan två datum (1 decimal). */
export function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  const days = (e.getTime() - s.getTime()) / 86400000;
  return Math.round((days / 30.4375) * 10) / 10;
}

/** Startdatum för en post (med bakåtkompatibel fallback till startMonth). */
export function entryStart(e: ScheduleEntry): string {
  return e.startDate || (e.startMonth ? `${e.startMonth}-01` : "");
}

export function entryEnd(e: ScheduleEntry): string {
  return e.endDate || "";
}

/** Visningsnamn: egen text för "Övrigt", annars placeringens namn. */
export function scheduleDisplayName(e: ScheduleEntry): string {
  if (e.department === "Övrigt") return e.customName?.trim() || "Övrigt";
  return e.department;
}

/** Summerar månader som räknas mot tjänstgöringstiden. */
export function countedMonths(entries: ScheduleEntry[]): number {
  return entries.filter(countsTowardService).reduce((s, e) => s + (e.months || 0), 0);
}
