// Domänmodell för kurser. Typen och de delade beräkningarna bor här så att
// kurssidan, delmålssidan och statistiken inte duplicerar logiken.

export type CourseCredits = Record<string, number>;

export type Course = {
  id: string;
  name: string;
  date: string;
  location?: string;
  url?: string;
  certificate: boolean;
  credits: CourseCredits;
  notes?: string;
  /** Genomförd (true) eller planerad (false/odefinierad). */
  done?: boolean;
};

/** Summerar insamlade kurspoäng per delmåls-id över alla kurser. */
export function earnedByMilestone(courses: Course[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const c of courses) {
    for (const [mid, credit] of Object.entries(c.credits)) {
      map[mid] = (map[mid] || 0) + (credit || 0);
    }
  }
  return map;
}

/** Delmåls-id:n som en kurs ger poäng till (för auto-registrering). */
export function creditedMilestoneIds(c: Course): string[] {
  return Object.keys(c.credits).filter((mid) => (c.credits[mid] || 0) > 0);
}

export type CourseLink = {
  id: string;
  name: string;
  date: string;
  points: number;
};

/** Index: delmåls-id -> bidragande kurser med poäng. */
export function courseLinksByMilestone(courses: Course[]): Record<string, CourseLink[]> {
  const map: Record<string, CourseLink[]> = {};
  for (const c of courses) {
    for (const [mid, pts] of Object.entries(c.credits)) {
      if (!pts) continue;
      (map[mid] ||= []).push({
        id: c.id,
        name: c.name,
        date: c.date,
        points: pts,
      });
    }
  }
  return map;
}
