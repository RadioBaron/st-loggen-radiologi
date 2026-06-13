// Delad beräkning av ST-progressen. Läser all lokal data och returnerar
// sammanställningen som används i Översikt och Ansökan.
import { useMemo } from "react";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { DEFAULT_MILESTONES, ALL_MILESTONES } from "@/lib/data/milestones";
import { DEFAULT_PROFILE, type Profile } from "@/lib/data/profile";
import { countsTowardService, type ScheduleEntry } from "@/routes/schema";
import type { Course } from "@/routes/kurser";
import type { SupervisionSession } from "@/routes/handledarsamtal";

export function useStData() {
  const [profile] = useLocalState<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  const [completed] = useLocalState<Record<string, boolean>>(
    STORAGE_KEYS.milestones,
    {},
  );
  const [schedule] = useLocalState<ScheduleEntry[]>(STORAGE_KEYS.schedule, []);
  const [courses] = useLocalState<Course[]>(STORAGE_KEYS.courses, []);
  const [sessions] = useLocalState<SupervisionSession[]>(
    STORAGE_KEYS.supervision,
    [],
  );

  return useMemo(() => {
    const goalMonths = profile.goalMonths || 60;
    const monthsLogged = schedule
      .filter(countsTowardService)
      .reduce((s, e) => s + (e.months || 0), 0);
    const monthsPct = Math.min(100, Math.round((monthsLogged / goalMonths) * 100));

    const totalMilestones = ALL_MILESTONES.length;
    const doneMilestones = ALL_MILESTONES.filter((m) => completed[m.id]).length;
    const milestonePct = totalMilestones
      ? Math.round((doneMilestones / totalMilestones) * 100)
      : 0;

    // Insamlade kurspoäng per delmål (informativt – inget fast krav).
    const earnedByMilestone: Record<string, number> = {};
    for (const c of courses) {
      for (const [mid, credit] of Object.entries(c.credits)) {
        earnedByMilestone[mid] = (earnedByMilestone[mid] || 0) + (credit || 0);
      }
    }
    const totalPoints = Object.values(earnedByMilestone).reduce((s, v) => s + v, 0);

    // Kurstäckning: andel delmål som har minst en kurspoäng.
    const coveredCount = ALL_MILESTONES.filter(
      (m) => (earnedByMilestone[m.id] || 0) > 0,
    ).length;
    const coveragePct = totalMilestones
      ? Math.round((coveredCount / totalMilestones) * 100)
      : 0;

    // Delmål som ännu inte är avbockade (för "närmast att fylla").
    const remainingMilestones = ALL_MILESTONES.filter((m) => !completed[m.id]).map(
      (m) => ({ ...m, earned: earnedByMilestone[m.id] || 0 }),
    );

    return {
      profile,
      categories: DEFAULT_MILESTONES,
      completed,
      schedule,
      courses,
      sessions,
      goalMonths,
      monthsLogged,
      monthsPct,
      totalMilestones,
      doneMilestones,
      milestonePct,
      earnedByMilestone,
      totalPoints,
      coveredCount,
      coveragePct,
      remainingMilestones,
    };
  }, [profile, completed, schedule, courses, sessions]);
}
