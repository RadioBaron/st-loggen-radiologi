// Delad beräkning av ST-progressen. Läser all lokal data + den aktiva
// specialiteten och returnerar sammanställningen som används i Översikt,
// Delmål, Kurser och Ansökan. Enda källan till sanning för progressen.
import { useMemo } from "react";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { useActiveSpecialty } from "@/lib/specialty";
import { DEFAULT_PROFILE, type Profile } from "@/lib/data/profile";
import { countsTowardService, type ScheduleEntry } from "@/lib/data/schedule";
import { earnedByMilestone, type Course } from "@/lib/data/courses";
import type { SupervisionSession } from "@/lib/data/supervision";

export function useStData() {
  const active = useActiveSpecialty();
  const [profile] = useLocalState<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  const [completed] = useLocalState<Record<string, boolean>>(STORAGE_KEYS.milestones, {});
  const [schedule] = useLocalState<ScheduleEntry[]>(STORAGE_KEYS.schedule, []);
  const [courses] = useLocalState<Course[]>(STORAGE_KEYS.courses, []);
  const [sessions] = useLocalState<SupervisionSession[]>(STORAGE_KEYS.supervision, []);

  const { categories, allMilestones } = active;

  return useMemo(() => {
    // Måltid: profilens värde om satt, annars specialitetens standard.
    const goalMonths = profile.goalMonths || active.goalMonths || 60;
    const monthsLogged = schedule
      .filter(countsTowardService)
      .reduce((s, e) => s + (e.months || 0), 0);
    const monthsPct = goalMonths ? Math.min(100, Math.round((monthsLogged / goalMonths) * 100)) : 0;

    const totalMilestones = allMilestones.length;
    const doneMilestones = allMilestones.filter((m) => completed[m.id]).length;
    const milestonePct = totalMilestones ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

    // Insamlade kurspoäng per delmål (informativt – inget fast krav).
    const earned = earnedByMilestone(courses);
    const totalPoints = Object.values(earned).reduce((s, v) => s + v, 0);

    // Kurstäckning: andel delmål som har minst en kurspoäng.
    const coveredCount = allMilestones.filter((m) => (earned[m.id] || 0) > 0).length;
    const coveragePct = totalMilestones ? Math.round((coveredCount / totalMilestones) * 100) : 0;

    // Delmål som ännu inte är avbockade (för "närmast att fylla").
    const remainingMilestones = allMilestones
      .filter((m) => !completed[m.id])
      .map((m) => ({ ...m, earned: earned[m.id] || 0 }));

    return {
      specialty: active.specialty,
      profile,
      categories,
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
      earnedByMilestone: earned,
      totalPoints,
      coveredCount,
      coveragePct,
      remainingMilestones,
    };
  }, [
    active.specialty,
    active.goalMonths,
    categories,
    allMilestones,
    profile,
    completed,
    schedule,
    courses,
    sessions,
  ]);
}
