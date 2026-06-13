import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ListChecks,
  CalendarRange,
  MessagesSquare,
  GraduationCap,
  FileCheck2,
  ArrowRight,
  CalendarClock,
  Sparkles,
} from "lucide-react";

import { useStData } from "@/lib/stats";
import { ProgressRing } from "@/components/ProgressRing";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Översikt – ST-loggen Radiologi" },
      { name: "description", content: "Översikt över din ST-progression: månader, delmål, kurser och handledarsamtal." },
    ],
  }),
  component: Dashboard,
});

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "";
}

function Dashboard() {
  const d = useStData();
  const hasProfile = d.profile.name.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-6 md:py-10">
      {/* Hero */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent p-6 md:p-8">
        <p className="text-sm font-medium text-primary">Min ST-utbildning</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {hasProfile ? `Hej ${firstName(d.profile.name)}!` : "Välkommen!"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Du har loggat{" "}
          <strong className="text-foreground">{d.monthsLogged} av {d.goalMonths}</strong>{" "}
          månaders tjänstgöring inom {d.profile.specialty.toLowerCase()}.
          {d.goalMonths - d.monthsLogged > 0
            ? ` ${(d.goalMonths - d.monthsLogged).toLocaleString("sv-SE")} månader kvar till målet.`
            : " Du har nått måltiden — dags att förbereda ansökan."}
        </p>

        {!hasProfile && (
          <Link
            to="/profil"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" /> Kom igång – fyll i din profil
          </Link>
        )}
      </div>

      {/* Tre pelare */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PillarCard
          to="/schema"
          ring={
            <ProgressRing
              value={d.monthsPct}
              label={<span className="font-display text-2xl font-semibold">{d.monthsPct}%</span>}
              sublabel={<span className="text-[11px] text-muted-foreground">tjänstgöring</span>}
            />
          }
          title="Tjänstgöring"
          detail={`${d.monthsLogged} / ${d.goalMonths} månader`}
        />
        <PillarCard
          to="/delmal"
          ring={
            <ProgressRing
              value={d.milestonePct}
              color="var(--color-success)"
              label={<span className="font-display text-2xl font-semibold">{d.milestonePct}%</span>}
              sublabel={<span className="text-[11px] text-muted-foreground">delmål</span>}
            />
          }
          title="Delmål"
          detail={`${d.doneMilestones} / ${d.totalMilestones} avklarade`}
        />
        <PillarCard
          to="/kurser"
          ring={
            <ProgressRing
              value={d.coveragePct}
              color="var(--color-accent-foreground)"
              label={<span className="font-display text-2xl font-semibold">{d.coveragePct}%</span>}
              sublabel={<span className="text-[11px] text-muted-foreground">täckning</span>}
            />
          }
          title="Kurser"
          detail={`${d.courses.length} kurser · ${d.totalPoints.toLocaleString("sv-SE")} poäng`}
        />
      </div>

      {/* Nästa steg + snabblänkar */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Delmål kvar att bocka av</h2>
            </div>
            {d.remainingMilestones.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Alla delmål är avbockade. 🎉
              </p>
            ) : (
              <ul className="space-y-2.5">
                {d.remainingMilestones.slice(0, 6).map((m) => (
                  <li key={m.id} className="flex items-center gap-4">
                    <span className="w-10 shrink-0 font-mono text-sm font-medium text-primary">
                      {m.shortTitle}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm">
                      {m.title.replace(/^[a-z0-9]+ – /i, "")}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {m.earned > 0 ? `${m.earned.toLocaleString("sv-SE")} p samlat` : "–"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/delmal"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Till delmål <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          <QuickLink to="/ansokan" icon={<FileCheck2 className="h-5 w-5" />} title="Förbered ansökan" description="Sammanställ allt inför specialistbeviset." highlight />
          <QuickLink to="/delmal" icon={<ListChecks className="h-5 w-5" />} title="Delmål" description="Bocka av delmål." />
          <QuickLink to="/handledarsamtal" icon={<MessagesSquare className="h-5 w-5" />} title="Handledarsamtal" description={`${d.sessions.length} sparade samtal`} />
        </div>
      </div>
    </div>
  );
}

function PillarCard({
  to,
  ring,
  title,
  detail,
}: {
  to: string;
  ring: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-6 text-center transition-all hover:border-primary/40 hover:shadow-sm"
    >
      {ring}
      <div>
        <p className="font-display text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
    </Link>
  );
}

function QuickLink({
  to,
  icon,
  title,
  description,
  highlight,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex items-start justify-between rounded-xl border p-5 transition-all hover:shadow-sm ${
        highlight
          ? "border-primary/40 bg-primary/5 hover:border-primary"
          : "border-border/60 bg-card hover:border-primary/40"
      }`}
    >
      <div>
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
