// Återanvändbar specialitetsväljare. Visar alla specialiteter grupperade enligt
// Socialstyrelsens indelning. Färdiginlagda specialiteter går att välja; övriga
// visas nedtonade med en "kommer snart"-markering. Används i onboarding och profil.
import { Check, Lock } from "lucide-react";

import { specialtiesByGroup, isSpecialtyReady } from "@/lib/data/specialties";
import { cn } from "@/lib/utils";

export function SpecialtyPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const groups = specialtiesByGroup();

  return (
    <div className="space-y-6">
      {groups.map(({ group, items }) => (
        <div key={group}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((s) => {
              const ready = isSpecialtyReady(s);
              const selected = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!ready}
                  onClick={() => ready && onSelect(s.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                    selected
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : ready
                        ? "border-border/60 bg-card hover:border-primary/40 hover:shadow-sm"
                        : "cursor-not-allowed border-dashed border-border/50 bg-muted/30 text-muted-foreground",
                  )}
                  aria-pressed={selected}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{s.name}</span>
                    {!ready && (
                      <span className="text-xs text-muted-foreground">Delmål kommer snart</span>
                    )}
                  </span>
                  {selected ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : !ready ? (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
