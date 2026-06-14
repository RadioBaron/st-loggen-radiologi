// Datamodell för specialiteter och deras delmål.
//
// Socialstyrelsens målbeskrivningar (HSLF-FS 2021:8) är uppbyggda så att varje
// specialitet har specialitetsövergripande delmål (gemensamma för alla) plus
// specialitetsspecifika delmål. Den här modellen speglar det: en specialitet är
// en lista av kategorier, där varje kategori innehåller delmål. Att lägga till en
// ny specialitet = lägga till en datamodul – ingen UI-kod behöver ändras.

export type Milestone = {
  id: string;
  /** Kort kod som visas i taggar, t.ex. "c5". */
  shortTitle: string;
  /** Hela rubriken inkl. kod, t.ex. "c5 – Thoraxradiologi". */
  title: string;
  /** Valfri längre beskrivning av kompetenskravet. */
  description?: string;
};

export type MilestoneCategory = {
  id: string;
  title: string;
  description?: string;
  milestones: Milestone[];
};

/** Var i specialitetsträdet en specialitet hör hemma (för gruppering i UI). */
export type SpecialtyGroup =
  | "Barn- och ungdomsmedicinska specialiteter"
  | "Bild- och funktionsmedicinska specialiteter"
  | "Enskilda basspecialiteter"
  | "Invärtesmedicinska specialiteter"
  | "Kirurgiska specialiteter"
  | "Laboratoriemedicinska specialiteter"
  | "Neurologiska specialiteter"
  | "Psykiatriska specialiteter"
  | "Tilläggsspecialiteter";

export type SpecialtyType = "bas" | "gren" | "tillagg";

/**
 * En specialitet. När `categories` saknas är specialiteten ännu inte
 * inlagd ("planerad") och kan inte väljas i appen – men den syns i listan.
 */
export type Specialty = {
  id: string;
  name: string;
  group: SpecialtyGroup;
  type: SpecialtyType;
  /** Rekommenderad tjänstgöringslängd i månader (kan justeras i profilen). */
  goalMonths: number;
  /** Standardplaceringar/randningar att välja i långtidsschemat. */
  departments?: string[];
  /** Delmålskategorier. Saknas = specialiteten är inte färdiginlagd ännu. */
  categories?: MilestoneCategory[];
};

/** True om specialiteten har delmål inlagda och kan användas fullt ut. */
export function isSpecialtyReady(s: Specialty): boolean {
  return Array.isArray(s.categories) && s.categories.length > 0;
}

/** Plattar ut alla delmål i en specialitet till en lista. */
export function allMilestonesOf(s: Specialty): Milestone[] {
  return (s.categories ?? []).flatMap((c) => c.milestones);
}
