import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { useActiveSpecialty } from "@/lib/specialty";
import { DEFAULT_PROFILE, type Profile } from "@/lib/data/profile";
import {
  countsTowardService,
  departmentOptions,
  monthsBetween,
  entryStart,
  entryEnd,
  scheduleDisplayName as displayName,
  countedMonths,
  type ScheduleEntry,
} from "@/lib/data/schedule";
import { genId, formatDate, nf } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type { ScheduleEntry } from "@/lib/data/schedule";
export { countsTowardService, NON_COUNTING_CATEGORIES } from "@/lib/data/schedule";

export const Route = createFileRoute("/schema")({
  head: () => ({
    meta: [
      { title: "Långtidsschema – STigen Radiologi" },
      { name: "description", content: "Planera och följ dina placeringar under ST." },
    ],
  }),
  component: SchedulePage,
});

type Draft = {
  department: string;
  customName: string;
  startDate: string;
  endDate: string;
  notes: string;
};

function emptyDraft(firstDepartment: string): Draft {
  return {
    department: firstDepartment,
    customName: "",
    startDate: "",
    endDate: "",
    notes: "",
  };
}

function SchedulePage() {
  const { specialty } = useActiveSpecialty();
  const [profile] = useLocalState<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  const [entries, setEntries] = useLocalState<ScheduleEntry[]>(STORAGE_KEYS.schedule, []);

  const departments = useMemo(() => departmentOptions(specialty?.departments), [specialty]);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(departments[0]));

  const goalMonths = profile.goalMonths || specialty?.goalMonths || 60;
  const today = new Date().toISOString().slice(0, 10);
  const draftMonths = monthsBetween(draft.startDate, draft.endDate);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => entryStart(a).localeCompare(entryStart(b))),
    [entries],
  );

  const totalMonths = countedMonths(entries);
  const pct = goalMonths ? Math.min(100, Math.round((totalMonths / goalMonths) * 100)) : 0;

  const byDept = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      const key = displayName(e);
      map.set(key, (map.get(key) || 0) + (e.months || 0));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const add = () => {
    if (draft.department === "Övrigt" && !draft.customName.trim()) {
      toast.error("Skriv in vilken randning/placering det gäller.");
      return;
    }
    if (!draft.startDate || !draft.endDate) {
      toast.error("Fyll i både start- och slutdatum.");
      return;
    }
    if (new Date(draft.endDate) < new Date(draft.startDate)) {
      toast.error("Slutdatum kan inte vara före startdatum.");
      return;
    }
    const months = monthsBetween(draft.startDate, draft.endDate);
    setEntries((prev) => [
      ...prev,
      {
        id: genId(),
        department: draft.department,
        customName: draft.department === "Övrigt" ? draft.customName.trim() : undefined,
        startDate: draft.startDate,
        endDate: draft.endDate,
        months,
        notes: draft.notes.trim() || undefined,
      },
    ]);
    toast.success("Placering tillagd");
    setDraft(emptyDraft(departments[0]));
  };

  const remove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-6 md:py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Tjänstgöring</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Långtidsschema
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Lägg in dina placeringar med start- och slutdatum. Målet är {goalMonths} månaders
          tjänstgöring (föräldra-/tjänstledighet räknas inte med).
        </p>
      </div>

      <Card className="mb-8 border-border/60">
        <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-display text-3xl font-semibold">
              {nf(totalMonths)} / {goalMonths}
            </p>
            <p className="text-sm text-muted-foreground">månaders tjänstgöring</p>
            <Progress value={pct} className="mt-3 h-2" />
            <p className="mt-1 text-sm text-muted-foreground">{pct}%</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Fördelning per placering</p>
            {byDept.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga placeringar inlagda ännu.</p>
            ) : (
              <ul className="space-y-1.5">
                {byDept.map(([dept, months]) => (
                  <li key={dept} className="flex items-center justify-between text-sm">
                    <span>{dept}</span>
                    <span className="text-muted-foreground">{nf(months)} mån</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-xl">Lägg till placering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dept">Placering</Label>
              <Select
                value={draft.department}
                onValueChange={(v) => setDraft((d) => ({ ...d, department: v }))}
              >
                <SelectTrigger id="dept" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {draft.department === "Övrigt" && (
              <div>
                <Label htmlFor="custom">Vilken randning?</Label>
                <Input
                  id="custom"
                  value={draft.customName}
                  onChange={(e) => setDraft((d) => ({ ...d, customName: e.target.value }))}
                  className="mt-1"
                  placeholder="Skriv in placering/randning"
                />
              </div>
            )}

            <div>
              <Label htmlFor="startDate">Startdatum</Label>
              <Input
                id="startDate"
                type="date"
                value={draft.startDate}
                onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">Slutdatum</Label>
              <Input
                id="endDate"
                type="date"
                value={draft.endDate}
                onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="notes">Anteckning (valfritt)</Label>
              <Input
                id="notes"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                className="mt-1"
                placeholder="t.ex. handledare, fokusområde"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {draftMonths > 0
                ? `Längd: ${nf(draftMonths)} månader`
                : "Ange datum för att beräkna längd"}
            </p>
            <Button onClick={add}>
              <Plus className="mr-1 h-4 w-4" /> Lägg till
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-xl">Tidslinje</CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Inga placeringar inlagda ännu. Lägg till din första ovan.
            </p>
          ) : (
            <ol className="relative ml-2 border-l border-border pl-6">
              {sorted.map((e, i) => {
                const start = entryStart(e);
                const end = entryEnd(e);
                const isCurrent = !!start && !!end && start <= today && today <= end;
                const nonCounting = !countsTowardService(e);
                return (
                  <li key={e.id} className={i === sorted.length - 1 ? "" : "pb-6"}>
                    <span
                      className={`absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                        isCurrent
                          ? "bg-primary ring-2 ring-primary/30"
                          : nonCounting
                            ? "bg-accent"
                            : "bg-muted-foreground/40"
                      }`}
                    />
                    <div className="group flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/30">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                          <p className="font-medium text-foreground">{displayName(e)}</p>
                          {isCurrent && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Pågår nu
                            </span>
                          )}
                          {nonCounting && (
                            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                              Räknas ej
                            </span>
                          )}
                          <span
                            className="inline-block h-1.5 rounded-full bg-primary/40"
                            style={{ width: `${Math.min(160, (e.months || 0) * 14)}px` }}
                            title={`${e.months} mån`}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(start)}
                          {end ? ` – ${formatDate(end)}` : ""} · {nf(e.months || 0)} mån
                        </p>
                        {e.notes && <p className="mt-1 text-sm text-muted-foreground">{e.notes}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(e.id)}
                        aria-label="Ta bort"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
