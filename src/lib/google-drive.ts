// Google Drive-koppling, helt på klientsidan via Google Identity Services
// (GIS) + Drive REST. Kräver att användaren skapar ett eget OAuth Client-ID
// (typ "Web application") i Google Cloud Console och anger det under
// Inställningar. Scope `drive.file` gör att appen bara kommer åt filer den
// själv skapat — den ser alltså inte resten av din Drive.

const BACKUP_NAME = "st-radiologi-backup.json";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

// Klient-ID och senaste fil-ID lagras lokalt (utanför backup-exporten).
const CFG_KEY = "st-radiologi:gdrive";

type DriveConfig = { clientId: string; fileId?: string };

// Minimal typning av den del av Google Identity Services-globalen vi använder.
type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: (opts?: { prompt?: string }) => void };
type GoogleOAuth = {
  accounts: {
    oauth2: {
      initTokenClient: (cfg: {
        client_id: string;
        scope: string;
        callback: (resp: TokenResponse) => void;
      }) => TokenClient;
    };
  };
};

function googleGlobal(): GoogleOAuth | undefined {
  return (globalThis as { google?: GoogleOAuth }).google;
}

export function readDriveConfig(): DriveConfig {
  if (typeof window === "undefined") return { clientId: "" };
  try {
    return JSON.parse(localStorage.getItem(CFG_KEY) || "") as DriveConfig;
  } catch {
    return { clientId: "" };
  }
}

export function writeDriveConfig(cfg: DriveConfig) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
}

// Ladda in GIS-scriptet en gång.
let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (googleGlobal()?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Kunde inte ladda Google-scriptet."));
    document.head.appendChild(s);
  });
  return gisPromise;
}

// Begär en access-token (öppnar Google-popup vid behov).
async function getAccessToken(clientId: string): Promise<string> {
  await loadGis();
  const google = googleGlobal();
  return new Promise((resolve, reject) => {
    if (!google) {
      reject(new Error("Google-scriptet är inte laddat."));
      return;
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp: TokenResponse) => {
        if (resp.error) reject(new Error(resp.error));
        else resolve(resp.access_token as string);
      },
    });
    client.requestAccessToken({ prompt: "" });
  });
}

async function findExisting(token: string): Promise<string | undefined> {
  const q = encodeURIComponent(`name='${BACKUP_NAME}' and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error("Kunde inte söka i Drive.");
  const data = await res.json();
  return data.files?.[0]?.id;
}

// Spara (skapa eller uppdatera) backup-filen i Drive.
export async function saveToDrive(jsonText: string): Promise<void> {
  const cfg = readDriveConfig();
  if (!cfg.clientId) throw new Error("Inget Google Client-ID angivet.");
  const token = await getAccessToken(cfg.clientId);
  const fileId = cfg.fileId || (await findExisting(token));

  const metadata = { name: BACKUP_NAME, mimeType: "application/json" };
  const boundary = "stlogboundary" + Date.now();
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    jsonText +
    `\r\n--${boundary}--`;

  const url = fileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  const res = await fetch(url, {
    method: fileId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error("Uppladdning till Drive misslyckades.");
  const saved = await res.json();
  writeDriveConfig({ ...cfg, fileId: saved.id });
}

// Hämta backup-filens innehåll från Drive.
export async function loadFromDrive(): Promise<string> {
  const cfg = readDriveConfig();
  if (!cfg.clientId) throw new Error("Inget Google Client-ID angivet.");
  const token = await getAccessToken(cfg.clientId);
  const fileId = cfg.fileId || (await findExisting(token));
  if (!fileId) throw new Error("Hittade ingen backup i Drive.");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Kunde inte hämta filen från Drive.");
  writeDriveConfig({ ...cfg, fileId });
  return res.text();
}
