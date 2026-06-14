import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, ExternalLink, Pencil, X, Check, Clock } from "lucide-react";
import { toast } from "sonner";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { useActiveSpecialty } from "@/lib/specialty";
import {
  earnedByMilestone as computeEarned,
  creditedMilestoneIds,
  type Course,
} from "@/lib/data/courses";
import type { MilestoneCategory } from "@/lib/data/specialties";
import { genId, nf } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type { Course, CourseCredits } from "@/lib/data/courses";

export const Route = createFileRoute("/kurser")({
  head: () => ({
    meta: [
      { title: "Kurser – STigen Radiologi" },
      { name: "description", content: "Logga genomförda kurser och poäng per delmål." },
    ],
  }),
  component: CoursesPage,
});

const RESOURCE_LINKS = [
  { label: "Socialstyrelsen SK-kurser", url: "https://www.socialstyrelsen.se/sk-kurser/" },
  {
    label: "SFMR kurser och kongresser",
    url: "https://www.sfmr.se/kurser/svenska-kurser-och-kongresser/",
  },
  { label: "ESR Congress Calendar", url: "https://congresscalendar.myesr.org/" },
  { label: "Lipus kurser", url: "https://www.lipus.se/" },
];

function emptyCourse(): Omit<Course, "id"> {
  return {
    name: "",
    date: "",
    location: "",
    url: "",
    certificate: false,
    credits: {},
    notes: "",
    done: false,
  };
}

function CoursesPage() {
  const { categories, allMilestones } = useActiveSpecialty();
  const [courses, setCourses] = useLocalState<Course[]>(STORAGE_KEYS.courses, []);
  const [, setCompletedMilestones] = useLocalState<Record<string, boolean>>(
    STORAGE_KEYS.milestones,
    {},
  );
  const [editing, setEditing] = useState<Course | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Registrera delmålen som en kurs ger (markera dem som klara).
  const registerMilestones = (c: Course) => {
    const ids = creditedMilestoneIds(c);
    if (ids.length === 0) return;
    setCompletedMilestones((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = true;
      return next;
    });
    toast.success(`Delmål registrerade: ${ids.join(", ")}`);
  };

  // Markera kurs som genomförd/planerad. Vid "genomförd" registreras delmålen.
  const toggleDone = (c: Course) => {
    const nextDone = !c.done;
    setCourses((prev) => prev.map((x) => (x.id === c.id ? { ...x, done: nextDone } : x)));
    if (nextDone) registerMilestones(c);
  };

  const openNew = () => {
    setEditing({ id: genId(), ...emptyCourse() });
    setIsNew(true);
  };

  const openEdit = (c: Course) => {
    setEditing({ ...c });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Kursen behöver ett namn");
      return;
    }
    setCourses((prev) =>
      isNew ? [...prev, editing] : prev.map((c) => (c.id === editing.id ? editing : c)),
    );
    if (editing.done) registerMilestones(editing);
    toast.success(isNew ? "Kurs tillagd" : "Kurs sparad");
    setEditing(null);
  };

  const remove = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const earnedByMilestone = useMemo(() => computeEarned(courses), [courses]);

  const totalEarned = allMilestones.reduce((s, m) => s + (earnedByMilestone[m.id] || 0), 0);
  const coveredCount = allMilestones.filter((m) => (earnedByMilestone[m.id] || 0) > 0).length;

  const planned = courses.filter((c) => !c.done);
  const doneCourses = courses.filter((c) => c.done);

  const renderCourse = (c: Course) => {
    const tags = Object.entries(c.credits)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k}${v !== 1 ? `:${v}` : ""}`)
      .join(", ");
    return (
      <li key={c.id} className="flex items-start gap-3 py-4">
        <Checkbox
          checked={!!c.done}
          onCheckedChange={() => toggleDone(c)}
          className="mt-1"
          aria-label="Markera som genomförd"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className={`font-medium ${c.done ? "text-muted-foreground" : "text-foreground"}`}>
              {c.name}
            </p>
            {c.certificate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-success)]/10 px-2 py-0.5 text-xs font-medium text-[color:var(--color-success)]">
                <Check className="h-3 w-3" /> Intyg
              </span>
            )}
            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                länk <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          {(c.date || c.location) && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {c.date}
              {c.location ? ` · ${c.location}` : ""}
            </p>
          )}
          {tags && <p className="mt-1 font-mono text-xs text-muted-foreground">Delmål: {tags}</p>}
          {c.notes && <p className="mt-1 text-sm text-muted-foreground">{c.notes}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Redigera">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => remove(c.id)} aria-label="Ta bort">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </li>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Kurser &amp; poäng
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">Kurser</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Lägg in kurser du planerar eller har gått, och tagga vilka delmål de ger. Bockar du av
            en kurs som genomförd registreras dess delmål automatiskt. Poängen (0,5 eller 1) är bara
            ett hjälpmedel – inget fast krav.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> Ny kurs
        </Button>
      </div>

      <Card className="mb-8 border-border/60">
        <CardContent className="flex flex-wrap items-center gap-8 p-6">
          <div>
            <p className="font-display text-3xl font-semibold">{courses.length}</p>
            <p className="text-sm text-muted-foreground">kurser loggade</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold">{nf(totalEarned)}</p>
            <p className="text-sm text-muted-foreground">poäng samlade</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold">
              {coveredCount} / {allMilestones.length}
            </p>
            <p className="text-sm text-muted-foreground">delmål med kursunderlag</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-xl">Poäng per delmål</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.id}>
                <p className="mb-3 text-sm font-medium text-muted-foreground">{cat.title}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {cat.milestones.map((m) => {
                    const earned = earnedByMilestone[m.id] || 0;
                    const has = earned > 0;
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          has
                            ? "border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/5"
                            : "border-border/60 bg-card"
                        }`}
                      >
                        <span className="font-mono text-sm font-medium">{m.shortTitle}</span>
                        <span
                          className={
                            has
                              ? "text-sm font-semibold text-[color:var(--color-success)]"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {has ? `${nf(earned)} p` : "–"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-xl">Mina kurser ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {courses.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Inga kurser inlagda ännu.</p>
              <Button onClick={openNew} className="mt-4">
                <Plus className="mr-1 h-4 w-4" /> Lägg till första kursen
              </Button>
            </div>
          ) : (
            <>
              {planned.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" /> Planerade ({planned.length})
                  </p>
                  <ul className="divide-y divide-border/60">{planned.map(renderCourse)}</ul>
                </div>
              )}
              {doneCourses.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-success)]">
                    <Check className="h-4 w-4" /> Genomförda ({doneCourses.length})
                  </p>
                  <ul className="divide-y divide-border/60">{doneCourses.map(renderCourse)}</ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg border border-border/60 bg-secondary/40 p-5">
        <p className="text-sm font-medium">Hitta kurser</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {RESOURCE_LINKS.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {l.label} <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>

      <CourseDialog
        course={editing}
        categories={categories}
        onChange={setEditing}
        onSave={save}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function CourseDialog({
  course,
  categories,
  onChange,
  onSave,
  onClose,
}: {
  course: Course | null;
  categories: MilestoneCategory[];
  onChange: (c: Course) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const setCredit = (mid: string, value: number) => {
    if (!course) return;
    const next = { ...course.credits };
    if (value <= 0) delete next[mid];
    else next[mid] = value;
    onChange({ ...course, credits: next });
  };

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {course && course.name ? course.name : "Ny kurs"}
          </DialogTitle>
        </DialogHeader>

        {course && (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="cname">Kursens namn</Label>
                <Input
                  id="cname"
                  value={course.name}
                  onChange={(e) => onChange({ ...course, name: e.target.value })}
                  className="mt-1"
                  placeholder="t.ex. SK-kurs Thoraxradiologi"
                />
              </div>
              <div>
                <Label htmlFor="cdate">Datum</Label>
                <Input
                  id="cdate"
                  value={course.date}
                  onChange={(e) => onChange({ ...course, date: e.target.value })}
                  className="mt-1"
                  placeholder="2024-05-13 – 2024-05-16"
                />
              </div>
              <div>
                <Label htmlFor="cloc">Ort</Label>
                <Input
                  id="cloc"
                  value={course.location ?? ""}
                  onChange={(e) => onChange({ ...course, location: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="curl">Länk (valfritt)</Label>
                <Input
                  id="curl"
                  type="url"
                  value={course.url ?? ""}
                  onChange={(e) => onChange({ ...course, url: e.target.value })}
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="cdone"
                  type="checkbox"
                  checked={!!course.done}
                  onChange={(e) => onChange({ ...course, done: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="cdone" className="cursor-pointer">
                  Kursen är genomförd – registrera dess delmål
                </Label>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="ccert"
                  type="checkbox"
                  checked={course.certificate}
                  onChange={(e) => onChange({ ...course, certificate: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="ccert" className="cursor-pointer">
                  Jag har sparat intyg från kursen
                </Label>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Poäng per delmål</p>
              <p className="text-xs text-muted-foreground">
                Klicka för 1,0 poäng. Klicka igen för 0,5 (del av delmål). Tredje klick rensar.
              </p>
              <div className="mt-3 space-y-4">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {cat.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.milestones.map((m) => {
                        const v = course.credits[m.id] || 0;
                        const onClick = () => {
                          const next = v === 0 ? 1 : v === 1 ? 0.5 : 0;
                          setCredit(m.id, next);
                        };
                        const base =
                          "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors";
                        const style =
                          v === 1
                            ? "border-primary bg-primary text-primary-foreground"
                            : v === 0.5
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40";
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={onClick}
                            className={`${base} ${style}`}
                            title={m.title}
                          >
                            {m.shortTitle}
                            {v > 0 && <span className="opacity-80">·{v}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="cnotes">Anteckning</Label>
              <Input
                id="cnotes"
                value={course.notes ?? ""}
                onChange={(e) => onChange({ ...course, notes: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-1 h-4 w-4" /> Avbryt
          </Button>
          <Button onClick={onSave}>
            <Check className="mr-1 h-4 w-4" /> Spara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
