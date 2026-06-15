// Migreringsramverk för lokalt lagrad data.
//
// All användardata ligger i localStorage. När datamodellen ändras (t.ex. ett
// fält byter namn eller en ny struktur införs) måste gammal data på enheten
// migreras framåt i stället för att tolkas fel. Varje migrering tar hela
// data-bunten (alla lagringsnycklar) från version v till v+1.
//
// Versionen stämplas i localStorage (se storage.ts). Vid uppstart körs
// migreringskedjan upp till CURRENT_DATA_VERSION. Vid import migreras en äldre
// backup på samma sätt innan den skrivs.
//
// Lägga till en migrering i framtiden:
//   1. Höj CURRENT_DATA_VERSION till N.
//   2. Lägg till MIGRATIONS[N - 1] som tar v(N-1) -> vN.
//   3. Skriv ett test som verifierar transformationen.

export const CURRENT_DATA_VERSION = 1;

/** Hela data-bunten: lagringsnyckel -> värde (ovaliderat, från disk/fil). */
export type DataBundle = Record<string, unknown>;

/** En migrering transformerar bunten från en version till nästa. */
export type Migration = (data: DataBundle) => DataBundle;

/**
 * Registret av migreringar, nyckel = versionen den uppgraderar FRÅN.
 * MIGRATIONS[1] tar alltså v1 -> v2. Tomt så länge vi är på v1.
 */
export const MIGRATIONS: Record<number, Migration> = {};

/**
 * Kör migreringskedjan från `fromVersion` upp till `toVersion`.
 * Kastar om data är från en nyare version än appen stödjer, eller om en
 * migrering i kedjan saknas (hellre tydligt fel än tyst korrupt data).
 *
 * `migrations` kan injiceras (för test); annars används det riktiga registret.
 */
export function applyMigrations(
  data: DataBundle,
  fromVersion: number,
  toVersion: number = CURRENT_DATA_VERSION,
  migrations: Record<number, Migration> = MIGRATIONS,
): DataBundle {
  if (!Number.isInteger(fromVersion) || fromVersion < 1) {
    throw new Error(`Ogiltig dataversion: ${fromVersion}.`);
  }
  if (fromVersion > toVersion) {
    throw new Error(
      `Datan är skapad i en nyare version (${fromVersion}) än den här appen stödjer (${toVersion}). Uppdatera appen och försök igen.`,
    );
  }

  let out = data;
  for (let v = fromVersion; v < toVersion; v++) {
    const migrate = migrations[v];
    if (!migrate) {
      throw new Error(`Saknar migrering från version ${v} till ${v + 1}.`);
    }
    out = migrate(out);
  }
  return out;
}
