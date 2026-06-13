// Bottennavigering för mobil. Visas bara på små skärmar (sidebar används på
// desktop). Fem flikar där "Mer" öppnar en panel med övriga sidor.
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  GraduationCap,
  CalendarRange,
  Menu,
  MessagesSquare,
  FileCheck2,
  Settings,
  User,
  Stethoscope,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const primary: {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { title: "Översikt", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Delmål", url: "/delmal", icon: ListChecks },
  { title: "Kurser", url: "/kurser", icon: GraduationCap },
  { title: "Schema", url: "/schema", icon: CalendarRange },
];

const more = [
  { title: "Ansökan", url: "/ansokan", icon: FileCheck2, desc: "Förbered specialistansökan" },
  { title: "Handledarsamtal", url: "/handledarsamtal", icon: MessagesSquare, desc: "Strukturerade samtal" },
  { title: "Profil", url: "/profil", icon: User, desc: "Dina uppgifter" },
  { title: "Inställningar & backup", url: "/installningar", icon: Settings, desc: "Exportera din data" },
] as const;

export function MobileNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path.startsWith(url);
  const moreActive = more.some((m) => path.startsWith(m.url));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {primary.map((item) => {
          const active = isActive(item.url, item.exact);
          return (
            <Link
              key={item.url}
              to={item.url}
              className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors"
            >
              <item.icon
                className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className={active ? "text-primary" : "text-muted-foreground"}>
                {item.title}
              </span>
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium">
              <Menu
                className={`h-5 w-5 ${moreActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className={moreActive ? "text-primary" : "text-muted-foreground"}>
                Mer
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-display">
                <Stethoscope className="h-5 w-5 text-primary" /> ST-loggen
              </SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 p-4">
              {more.map((m) => (
                <Link
                  key={m.url}
                  to={m.url}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium leading-tight">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
