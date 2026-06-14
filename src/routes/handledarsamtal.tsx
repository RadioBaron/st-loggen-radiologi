import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Save, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { SUPERVISION_TEMPLATE, type SupervisionSession } from "@/lib/data/supervision";
import { genId } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type { SupervisionSession } from "@/lib/data/supervision";

export const Route = createFileRoute("/handledarsamtal")({
  head: () => ({
    meta: [
      { title: "Handledarsamtal – STigen Radiologi" },
      { name: "description", content: "Strukturerade handledarsamtal med sparbara anteckningar." },
    ],
  }),
  component: SupervisionPage,
});

function SupervisionPage() {
  const [sessions, setSessions] = useLocalState<SupervisionSession[]>(STORAGE_KEYS.supervision, []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)),
    [sessions],
  );

  const active = sessions.find((s) => s.id === activeId);

  const createNew = () => {
    const now = new Date().toISOString();
    const session: SupervisionSession = {
      id: genId(),
      date: now.slice(0, 10),
      supervisor: "",
      location: "",
      answers: {},
      createdAt: now,
      updatedAt: now,
    };
    setSessions((prev) => [...prev, session]);
    setActiveId(session.id);
  };

  const update = (id: string, patch: Partial<SupervisionSession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s)),
    );
  };

  const remove = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  if (active) {
    return (
      <SessionEditor
        session={active}
        onBack={() => setActiveId(null)}
        onChange={(patch) => update(active.id, patch)}
        onDelete={() => {
          if (confirm("Ta bort detta samtal?")) {
            remove(active.id);
            toast.success("Samtal borttaget");
          }
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Reflektion</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">Handledarsamtal</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Strukturerade samtal med din handledare. Mallen följer ST:s återkommande
            utvecklingssamtal.
          </p>
        </div>
        <Button onClick={createNew}>
          <Plus className="mr-1 h-4 w-4" /> Nytt samtal
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Inga handledarsamtal sparade ännu.</p>
            <Button onClick={createNew} className="mt-4">
              <Plus className="mr-1 h-4 w-4" /> Skapa det första
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sorted.map((s) => {
            const answered = Object.values(s.answers).filter((v) => v.trim().length > 0).length;
            const totalQs = SUPERVISION_TEMPLATE.reduce((a, sec) => a + sec.questions.length, 0);
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className="group flex w-full items-center justify-between rounded-xl border border-border/60 bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div>
                  <p className="font-display text-lg font-semibold">
                    {new Date(s.date).toLocaleDateString("sv-SE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {s.supervisor || "Ingen handledare angiven"}
                    {s.location ? ` · ${s.location}` : ""}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {answered} / {totalQs} frågor besvarade
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SessionEditor({
  session,
  onBack,
  onChange,
  onDelete,
}: {
  session: SupervisionSession;
  onBack: () => void;
  onChange: (patch: Partial<SupervisionSession>) => void;
  onDelete: () => void;
}) {
  const setAnswer = (sectionId: string, questionId: string, value: string) => {
    onChange({
      answers: { ...session.answers, [`${sectionId}:${questionId}`]: value },
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Tillbaka till alla samtal
      </button>

      <Card className="mb-6 border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Handledarsamtal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={session.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sup">Handledare</Label>
              <Input
                id="sup"
                value={session.supervisor}
                onChange={(e) => onChange({ supervisor: e.target.value })}
                className="mt-1"
                placeholder="Namn"
              />
            </div>
            <div>
              <Label htmlFor="loc">Plats / klinik</Label>
              <Input
                id="loc"
                value={session.location ?? ""}
                onChange={(e) => onChange({ location: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {SUPERVISION_TEMPLATE.map((section) => (
          <Card key={section.id} className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {section.questions.map((q) => {
                const key = `${section.id}:${q.id}`;
                return (
                  <div key={q.id}>
                    <Label htmlFor={key} className="text-sm font-medium text-foreground">
                      {q.question}
                    </Label>
                    {q.hint && <p className="text-xs text-muted-foreground">{q.hint}</p>}
                    <Textarea
                      id={key}
                      value={session.answers[key] ?? ""}
                      onChange={(e) => setAnswer(section.id, q.id, e.target.value)}
                      rows={3}
                      className="mt-1.5"
                      placeholder="Skriv din reflektion…"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Sparas automatiskt · senast uppdaterad{" "}
          {new Date(session.updatedAt).toLocaleString("sv-SE")}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4" /> Ta bort
          </Button>
          <Button
            onClick={() => {
              toast.success("Sparat lokalt");
              onBack();
            }}
          >
            <Save className="mr-1 h-4 w-4" /> Klart
          </Button>
        </div>
      </div>
    </div>
  );
}
