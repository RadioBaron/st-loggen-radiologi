// Förstagångsval av specialitet. Visas som helskärmsöverlägg tills användaren
// valt en specialitet. Valet styr sedan delmål och allt innehåll i appen.
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/Logo";
import { SpecialtyPicker } from "@/components/SpecialtyPicker";
import { Button } from "@/components/ui/button";
import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { DEFAULT_PROFILE, type Profile } from "@/lib/data/profile";
import { getSpecialty } from "@/lib/data/specialties";

export function SpecialtyOnboarding({ onChosen }: { onChosen: (id: string) => void }) {
  const [selected, setSelected] = useState("");
  const [, setProfile] = useLocalState<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);

  const confirm = () => {
    const s = getSpecialty(selected);
    if (!s) return;
    // Synka profilens specialitetsnamn och måltid med valet.
    setProfile((p) => ({
      ...p,
      specialty: s.name,
      goalMonths: p.goalMonths || s.goalMonths,
    }));
    onChosen(selected);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 md:px-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-16 w-16" />
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Välkommen till STigen
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Välj din specialitet för att komma igång. Delmål, kurser och ansökningshjälp anpassas
            efter den du väljer. Du kan byta senare i din profil.
          </p>
        </div>

        <SpecialtyPicker selectedId={selected} onSelect={setSelected} />

        <div className="sticky bottom-0 mt-8 -mx-5 border-t border-border bg-background/95 px-5 py-4 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {selected ? `Vald: ${getSpecialty(selected)?.name}` : "Ingen specialitet vald ännu"}
            </p>
            <Button onClick={confirm} disabled={!selected}>
              Fortsätt <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
