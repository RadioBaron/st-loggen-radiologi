import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, GraduationCap, Plus } from "lucide-react";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { DEFAULT_MILESTONES } from "@/lib/data/milestones";
import type { Course } from "@/routes/kurser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/delmal")({
  head: () => ({
    meta: [
      { title: "Delmål – STigen Radiologi" },
      { name: "description", content: "Kryssa av delmål och se vilka kurser som kopplats till varje delmål." },
    ],
  }),
  component: MilestonesPage,
});

type CourseLink = { id: string; name: string; date: string; points: number };

function MilestonesPage() {
  const [completed, setCompleted] = useLocalState<Record<string, boolean>>(
    STORAGE_KEYS.milestones,
    {},
  );
  const [courses] = useLocalState<Course[]>(STORAGE_KEYS.courses, []);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));

  // Bygg index: delmål-id -> lista av bidragande kurser med poäng.
  const linksByMilestone = useMemo(() => {
    const map: Record<string, CourseLink[]> = {};
    for (const c of courses) {
      for (const [mid, pts] of Object.entries(c.credits)) {
        if (!pts) continue;
        (map[mid] ||= []).push({ id: c.id, name: c.name, date: c.date, points: pts });
      }
    }
    return map;
  }, [courses]);

  const totals = useMemo(() => {
    const total = DEFAULT_MILESTONES.reduce((s, c) => s + c.milestones.length, 0);
    const done = DEFAULT_MILESTONES.reduce(
      (s, c) => s + c.milestones.filter((m) => completed[m.id]).length,
      0,
    );
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [completed]);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-6 md:py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Målbeskrivning</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">Delmål</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Bocka av delmålen efterhand som du uppfyller dem. Öppna ett delmål för
          att se vilka kurser som kopplats dit.
        </p>
      </div>

      <Card className="mb-8 border-border/60">
        <CardContent className="flex items-center justify-between gap-6 p-6">
          <div>
            <p className="font-display text-3xl font-semibold">
              {totals.done} / {totals.total}
            </p>
            <p className="text-sm text-muted-foreground">avklarade delmål</p>
          </div>
          <div className="max-w-md flex-1">
            <Progress value={totals.pct} className="h-2" />
            <p className="mt-2 text-right text-sm text-muted-foreground">{totals.pct}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {DEFAULT_MILESTONES.map((category) => {
          const catDone = category.milestones.filter((m) => completed[m.id]).length;
          return (
            <Card key={category.id} className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between font-display text-xl">
                  <span>{category.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {catDone} / {category.milestones.length}
                  </span>
                </CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border/60">
                  {category.milestones.map((m) => {
                    const isDone = !!completed[m.id];
                    const links = linksByMilestone[m.id] ?? [];
                    const points = links.reduce((s, l) => s + l.points, 0);
                    const isOpen = !!open[m.id];
                    return (
                      <li key={m.id}>
                        <div className="flex items-center gap-3 py-3">
                          <Checkbox checked={isDone} onCheckedChange={() => toggle(m.id)} />
                          <button
                            type="button"
                            onClick={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))}
                            className="flex flex-1 items-center justify-between gap-3 text-left"
                          >
                            <span className={isDone ? "text-muted-foreground line-through" : "text-foreground"}>
                              {m.title}
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              {links.length > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                  <GraduationCap className="h-3 w-3" />
                                  {links.length} · {points.toLocaleString("sv-SE")} p
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">inga kurser</span>
                              )}
                              <ChevronDown
                                className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                              />
                            </span>
                          </button>
                        </div>

                        {isOpen && (
                          <div className="mb-3 ml-7 rounded-lg border border-border/60 bg-secondary/30 p-3">
                            {links.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                Inga kurser kopplade till detta delmål ännu.{" "}
                                <Link to="/kurser" className="inline-flex items-center gap-1 text-primary hover:underline">
                                  <Plus className="h-3 w-3" /> Lägg till kurs
                                </Link>
                              </p>
                            ) : (
                              <ul className="space-y-1.5">
                                {links.map((l) => (
                                  <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="min-w-0 flex-1 truncate">
                                      {l.name}
                                      {l.date && (
                                        <span className="text-muted-foreground"> · {l.date}</span>
                                      )}
                                    </span>
                                    <span className="shrink-0 font-mono text-xs text-primary">
                                      {l.points.toLocaleString("sv-SE")} p
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
