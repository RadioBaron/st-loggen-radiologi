import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, Printer, CheckCircle2, AlertCircle, Circle } from "lucide-react";

import { useStData } from "@/lib/stats";
import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/ansokan")({
  head: () => ({
    meta: [
      { title: "Ansökan – ST-loggen Radiologi" },
      { name: "description", content: "Förbered din ansökan om bevis om specialistkompetens." },
    ],
  }),
  component: ApplicationPage,
});

// Underlag som Socialstyrelsen kräver (intyg/blanketter) för ansökan om
// bevis om specialistkompetens enligt SOSFS/HSLF-FS 2021:8.
const CHECKLIST: { id: string; label: string; hint?: string }[] = [
  { id: "tjanstgoring", label: "Intyg om klinisk tjänstgöring under handledning", hint: "Ett intyg per tjänstgöringsperiod, signerat av handledare." },
  { id: "delmal", label: "Intyg om uppnådd kompetens för samtliga delmål", hint: "Bedömning per delmål, signerad av handledare." },
  { id: "kurser", label: "Kursintyg för samtliga genomförda kurser", hint: "Samlas in löpande under ST." },
  { id: "vetenskap", label: "Intyg om skriftligt individuellt arbete (delmål a5)", hint: "Vetenskapligt arbete enligt vetenskapliga principer." },
  { id: "kvalitet", label: "Intyg om självständigt kvalitets- och förbättringsarbete (delmål a4)" },
  { id: "summa", label: "Intyg om uppnådd specialistkompetens", hint: "Sammanfattande intyg signerat av huvudhandledare och verksamhetschef." },
  { id: "blankett", label: "Ifylld ansökningsblankett till Socialstyrelsen", hint: "Skickas via Socialstyrelsens e-tjänst." },
];

function StatusIcon({ ok, warn }: { ok: boolean; warn?: boolean }) {
  if (ok) return <CheckCircle2 className="h-5 w-5 text-[color:var(--color-success)]" />;
  if (warn) return <AlertCircle className="h-5 w-5 text-amber-500" />;
  return <Circle className="h-5 w-5 text-muted-foreground" />;
}

function ApplicationPage() {
  const d = useStData();
  const [checks, setChecks] = useLocalState<Record<string, boolean>>(
    STORAGE_KEYS.application,
    {},
  );

  const monthsOk = d.monthsLogged >= d.goalMonths;
  const delmalOk = d.doneMilestones === d.totalMilestones;
  const checklistDone = CHECKLIST.filter((c) => checks[c.id]).length;

  const readiness = [
    { label: "Tjänstgöring", ok: monthsOk, value: `${d.monthsLogged} / ${d.goalMonths} mån` },
    { label: "Delmål avklarade", ok: delmalOk, value: `${d.doneMilestones} / ${d.totalMilestones}` },
    { label: "Kurser", ok: d.courses.length > 0, warn: d.courses.length === 0, value: `${d.courses.length} st` },
    { label: "Handledarsamtal", ok: d.sessions.length > 0, warn: d.sessions.length === 0, value: `${d.sessions.length} st` },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-6 md:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Inför specialistbeviset</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            <FileCheck2 className="h-7 w-7 text-primary" /> Ansökan
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Här samlas allt du behöver inför ansökan om bevis om
            specialistkompetens. Bocka av underlagen och skriv ut en
            sammanställning till din handledare.
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" /> Skriv ut / PDF
        </Button>
      </div>

      {/* Status */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        {readiness.map((r) => (
          <Card key={r.label} className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <StatusIcon ok={r.ok} warn={r.warn} />
              <div>
                <p className="text-sm text-muted-foreground">{r.label}</p>
                <p className="font-display text-lg font-semibold">{r.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checklista */}
      <Card className="mb-6 border-border/60 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-display text-lg">
            <span>Checklista – underlag att samla in</span>
            <span className="text-sm font-normal text-muted-foreground">
              {checklistDone} / {CHECKLIST.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60">
            {CHECKLIST.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-start gap-3 py-3">
                  <Checkbox
                    checked={!!checks[c.id]}
                    onCheckedChange={() =>
                      setChecks((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <p className={checks[c.id] ? "text-muted-foreground line-through" : ""}>
                      {c.label}
                    </p>
                    {c.hint && <p className="text-xs text-muted-foreground">{c.hint}</p>}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Utskriftsvänlig sammanställning */}
      <PrintableSummary d={d} />
    </div>
  );
}

function PrintableSummary({ d }: { d: ReturnType<typeof useStData> }) {
  const p = d.profile;
  const startOf = (e: (typeof d.schedule)[number]) =>
    e.startDate || (e.startMonth ? `${e.startMonth}-01` : "");
  const nameOf = (e: (typeof d.schedule)[number]) =>
    e.department === "Övrigt" ? e.customName?.trim() || "Övrigt" : e.department;
  const fmtDate = (s: string) =>
    s
      ? new Date(s).toLocaleDateString("sv-SE", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "–";
  const sortedSchedule = [...d.schedule].sort((a, b) =>
    startOf(a).localeCompare(startOf(b)),
  );
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-6 p-6 md:p-8">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Sammanställning av ST – {p.specialty || "Radiologi"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Genererad {new Date().toLocaleDateString("sv-SE")} · ST-loggen
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
          <Field label="Namn" value={p.name} />
          <Field label="Specialitet" value={p.specialty} />
          <Field label="Region" value={p.region} />
          <Field label="Klinik" value={p.clinic} />
          <Field label="Legitimationsdatum" value={p.licenseDate} />
          <Field label="ST-start" value={p.startDate} />
          <Field label="Huvudhandledare" value={p.supervisor} />
          <Field label="Studierektor" value={p.studyDirector} />
          <Field label="Verksamhetschef" value={p.headOfDept} />
        </dl>

        <SummaryStat
          items={[
            { label: "Tjänstgöring", value: `${d.monthsLogged} av ${d.goalMonths} mån` },
            { label: "Delmål avklarade", value: `${d.doneMilestones} av ${d.totalMilestones}` },
            { label: "Kurser", value: `${d.courses.length} st` },
            { label: "Handledarsamtal", value: `${d.sessions.length} st` },
          ]}
        />

        {/* Placeringar */}
        <section>
          <h3 className="mb-2 font-display text-base font-semibold">Tjänstgöringsplaceringar</h3>
          {sortedSchedule.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga placeringar inlagda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-1 font-medium">Placering</th>
                  <th className="py-1 font-medium">Period</th>
                  <th className="py-1 text-right font-medium">Mån</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchedule.map((e) => (
                  <tr key={e.id} className="border-b border-border/40">
                    <td className="py-1">{nameOf(e)}</td>
                    <td className="py-1">
                      {fmtDate(startOf(e))}
                      {e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}
                    </td>
                    <td className="py-1 text-right">{(e.months || 0).toLocaleString("sv-SE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Kurser */}
        <section>
          <h3 className="mb-2 font-display text-base font-semibold">
            Genomförda kurser ({d.courses.length})
          </h3>
          {d.courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga kurser inlagda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-1 font-medium">Kurs</th>
                  <th className="py-1 font-medium">Datum</th>
                  <th className="py-1 font-medium">Delmål</th>
                </tr>
              </thead>
              <tbody>
                {d.courses.map((c) => (
                  <tr key={c.id} className="border-b border-border/40">
                    <td className="py-1">{c.name}</td>
                    <td className="py-1">{c.date}</td>
                    <td className="py-1 font-mono text-xs">
                      {Object.keys(c.credits).filter((k) => c.credits[k] > 0).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Delmålsstatus */}
        <section>
          <h3 className="mb-2 font-display text-base font-semibold">Delmål – status</h3>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {d.categories.flatMap((cat) => cat.milestones).map((m) => {
              const earned = d.earnedByMilestone[m.id] || 0;
              const done = !!d.completed[m.id];
              return (
                <div key={m.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-mono text-xs text-muted-foreground">{m.shortTitle}</span>{" "}
                    {m.title.replace(/^[a-z0-9]+ – /i, "")}
                  </span>
                  <span className={`shrink-0 text-xs ${done ? "text-[color:var(--color-success)]" : "text-muted-foreground"}`}>
                    {done ? "✓ klar" : earned > 0 ? `${earned.toLocaleString("sv-SE")} p` : "–"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "–"}</dd>
    </div>
  );
}

function SummaryStat({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-secondary/40 p-4 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.label}>
          <p className="text-xs text-muted-foreground">{it.label}</p>
          <p className="font-display text-lg font-semibold">{it.value}</p>
        </div>
      ))}
    </div>
  );
}
