import { createFileRoute } from "@tanstack/react-router";
import { Save, User } from "lucide-react";
import { toast } from "sonner";

import { useLocalState, STORAGE_KEYS } from "@/lib/storage";
import { DEFAULT_PROFILE, type Profile } from "@/lib/data/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil – STigen Radiologi" },
      { name: "description", content: "Dina uppgifter som används i översikten och specialistansökan." },
    ],
  }),
  component: ProfilePage,
});

const FIELDS: { key: keyof Profile; label: string; placeholder?: string; type?: string }[] = [
  { key: "name", label: "Namn", placeholder: "För- och efternamn" },
  { key: "specialty", label: "Specialitet" },
  { key: "region", label: "Region / sjukvårdshuvudman", placeholder: "t.ex. Västra Götalandsregionen" },
  { key: "clinic", label: "Klinik / arbetsplats", placeholder: "t.ex. Röntgen, Sahlgrenska" },
  { key: "licenseDate", label: "Legitimationsdatum", type: "date" },
  { key: "startDate", label: "ST-startdatum", type: "date" },
  { key: "supervisor", label: "Huvudhandledare" },
  { key: "studyDirector", label: "Studierektor" },
  { key: "headOfDept", label: "Verksamhetschef" },
];

function ProfilePage() {
  const [profile, setProfile] = useLocalState<Profile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE,
  );

  const set = (key: keyof Profile, value: string | number) =>
    setProfile((p) => ({ ...p, [key]: value }));

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-6 md:py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Mina uppgifter</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          <User className="h-7 w-7 text-primary" /> Profil
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Uppgifterna används i översikten och förifylls automatiskt i
          ansökningshjälpen. Allt sparas lokalt på din enhet.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-lg">Grunduppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.key === "name" ? "sm:col-span-2" : ""}>
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type={f.type ?? "text"}
                  value={(profile[f.key] as string) ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="mt-1"
                />
              </div>
            ))}
            <div>
              <Label htmlFor="goalMonths">Måltid (månader)</Label>
              <Input
                id="goalMonths"
                type="number"
                min={1}
                max={120}
                value={profile.goalMonths}
                onChange={(e) => set("goalMonths", Math.max(1, Number(e.target.value) || 60))}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            className="mt-6"
            onClick={() => toast.success("Profil sparad")}
          >
            <Save className="mr-1 h-4 w-4" /> Spara
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Ändringar sparas automatiskt medan du skriver.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
