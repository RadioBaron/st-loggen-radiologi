import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Download,
  Upload,
  HardDriveDownload,
  HardDriveUpload,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  exportAllData,
  importAllData,
  getBackupJson,
  importFromJson,
} from "@/lib/storage";
import {
  readDriveConfig,
  writeDriveConfig,
  saveToDrive,
  loadFromDrive,
} from "@/lib/google-drive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/installningar")({
  head: () => ({
    meta: [
      { title: "Inställningar – STigen Radiologi" },
      { name: "description", content: "Exportera, importera och säkerhetskopiera dina data till Google Drive." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const onImport = async (file: File) => {
    try {
      await importAllData(file);
      toast.success("Data importerad");
    } catch (e) {
      toast.error((e as Error).message || "Kunde inte läsa filen");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-6 md:py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Backup &amp; lagring
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Inställningar
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          All din data lagras lokalt i den här webbläsaren. Ta backup
          regelbundet – till en fil eller direkt till din Google Drive.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleDriveCard />

        <SimpleDriveCard />

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Download className="h-5 w-5 text-primary" /> Exportera till fil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Skapar en JSON-fil med alla dina delmål, schema, kurser och
              handledarsamtal.
            </p>
            <Button onClick={exportAllData}>
              <Download className="mr-1 h-4 w-4" /> Ladda ner backup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Upload className="h-5 w-5 text-primary" /> Importera från fil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Återställ från en tidigare backup-fil. Befintlig data skrivs över.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1 h-4 w-4" /> Välj backup-fil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Enkel variant: ladda ner + öppna Drive ---------------------------------

function SimpleDriveCard() {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <HardDriveUpload className="h-5 w-5 text-primary" /> Spara till Google
          Drive (manuellt)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Ladda ner backup-filen och släpp den sedan i Google Drive. Ingen
          inloggning krävs.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              exportAllData();
              toast.success("Backup nedladdad – släpp den i Drive-fönstret");
            }}
          >
            <Download className="mr-1 h-4 w-4" /> Ladda ner &amp; öppna Drive
          </Button>
          <a
            href="https://drive.google.com/drive/my-drive"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Öppna Google Drive <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Riktig OAuth-koppling ---------------------------------------------------

function GoogleDriveCard() {
  const [clientId, setClientId] = useState(() => readDriveConfig().clientId);
  const [busy, setBusy] = useState<null | "save" | "load">(null);

  const connected = clientId.trim().length > 0;

  const saveId = () => {
    writeDriveConfig({ ...readDriveConfig(), clientId: clientId.trim() });
    toast.success("Client-ID sparat");
  };

  const doSave = async () => {
    setBusy("save");
    try {
      await saveToDrive(getBackupJson());
      toast.success("Sparat till Google Drive");
    } catch (e) {
      toast.error((e as Error).message || "Kunde inte spara till Drive");
    } finally {
      setBusy(null);
    }
  };

  const doLoad = async () => {
    setBusy("load");
    try {
      const text = await loadFromDrive();
      importFromJson(text);
      toast.success("Hämtat från Google Drive");
    } catch (e) {
      toast.error((e as Error).message || "Kunde inte hämta från Drive");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <HardDriveDownload className="h-5 w-5 text-primary" /> Synka med Google
          Drive
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Spara och hämta din backup direkt i Google Drive. Appen kommer bara åt
          filer den själv skapat. Engångsuppsättning: skapa ett gratis OAuth
          Client-ID och klistra in det nedan.
        </p>

        <div>
          <Label htmlFor="clientId">Google OAuth Client-ID</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="…apps.googleusercontent.com"
              className="min-w-[260px] flex-1"
            />
            <Button variant="outline" onClick={saveId}>
              Spara ID
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={doSave} disabled={!connected || busy !== null}>
            {busy === "save" ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <HardDriveUpload className="mr-1 h-4 w-4" />
            )}
            Spara till Drive
          </Button>
          <Button
            variant="outline"
            onClick={doLoad}
            disabled={!connected || busy !== null}
          >
            {busy === "load" ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <HardDriveDownload className="mr-1 h-4 w-4" />
            )}
            Hämta från Drive
          </Button>
        </div>

        <details className="rounded-lg border border-border/60 bg-background p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Så här skapar du ett Client-ID (≈5 min)
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>
              Gå till{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console → Credentials
              </a>{" "}
              och skapa ett projekt.
            </li>
            <li>
              Aktivera <strong>Google Drive API</strong> under "Enabled APIs".
            </li>
            <li>
              Skapa <strong>OAuth client ID</strong> av typen{" "}
              <strong>Web application</strong>.
            </li>
            <li>
              Lägg till din webbadress under{" "}
              <em>Authorized JavaScript origins</em> (t.ex.{" "}
              <code>http://localhost:8080</code> och din publika adress).
            </li>
            <li>Kopiera Client-ID:t och klistra in det ovan.</li>
          </ol>
        </details>
      </CardContent>
    </Card>
  );
}
