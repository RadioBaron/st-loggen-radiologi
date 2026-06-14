// Register över alla specialiteter enligt Socialstyrelsens målbeskrivningar
// (HSLF-FS 2021:8). Specialiteter med inlagda delmål (`categories`) kan väljas
// och användas fullt ut. Övriga visas som "kommer snart" tills deras delmål
// lagts in – lägg bara till en datamodul och referera den här.

import type { Specialty, SpecialtyGroup, SpecialtyType } from "./types";
import { RADIOLOGI } from "./radiologi";
import { buildCategories } from "./common";
import { GENERATED_DELMAL } from "./generated";

export type {
  Specialty,
  SpecialtyGroup,
  SpecialtyType,
  Milestone,
  MilestoneCategory,
} from "./types";
export { isSpecialtyReady, allMilestonesOf } from "./types";

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Deklarerar en specialitet. Delmålen hämtas automatiskt från det genererade
// registret (STa/STb/STc) om id:t finns där; annars blir specialiteten "planerad".
function specialty(
  name: string,
  group: SpecialtyGroup,
  type: SpecialtyType,
  goalMonths: number,
): Specialty {
  const id = slug(name);
  const gen = GENERATED_DELMAL[id];
  return {
    id,
    name,
    group,
    type,
    goalMonths,
    categories: gen ? buildCategories(gen.stb, gen.stc) : undefined,
  };
}

const BAS = 60;
const GREN = 30;
const TILLAGG = 24;

export const SPECIALTIES: Specialty[] = [
  // Bild- och funktionsmedicinska specialiteter
  RADIOLOGI,
  specialty("Klinisk fysiologi", "Bild- och funktionsmedicinska specialiteter", "bas", BAS),
  specialty("Neuroradiologi", "Bild- och funktionsmedicinska specialiteter", "gren", GREN),

  // Barn- och ungdomsmedicinska specialiteter
  specialty("Barn- och ungdomsmedicin", "Barn- och ungdomsmedicinska specialiteter", "bas", BAS),
  specialty(
    "Barn- och ungdomsallergologi",
    "Barn- och ungdomsmedicinska specialiteter",
    "gren",
    GREN,
  ),
  specialty(
    "Barn- och ungdomshematologi och onkologi",
    "Barn- och ungdomsmedicinska specialiteter",
    "gren",
    GREN,
  ),
  specialty(
    "Barn- och ungdomskardiologi",
    "Barn- och ungdomsmedicinska specialiteter",
    "gren",
    GREN,
  ),
  specialty(
    "Barn- och ungdomsneurologi med habilitering",
    "Barn- och ungdomsmedicinska specialiteter",
    "gren",
    GREN,
  ),
  specialty("Neonatologi", "Barn- och ungdomsmedicinska specialiteter", "gren", GREN),

  // Enskilda basspecialiteter
  specialty("Akutsjukvård", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Allmänmedicin", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Arbets- och miljömedicin", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Hud- och könssjukdomar", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Infektionssjukdomar", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Klinisk farmakologi", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Klinisk genetik", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Onkologi", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Reumatologi", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Rättsmedicin", "Enskilda basspecialiteter", "bas", BAS),
  specialty("Socialmedicin", "Enskilda basspecialiteter", "bas", BAS),

  // Invärtesmedicinska specialiteter
  specialty("Endokrinologi och diabetologi", "Invärtesmedicinska specialiteter", "bas", BAS),
  specialty("Geriatrik", "Invärtesmedicinska specialiteter", "bas", BAS),
  specialty("Hematologi", "Invärtesmedicinska specialiteter", "bas", BAS),
  specialty("Internmedicin", "Invärtesmedicinska specialiteter", "bas", BAS),
  specialty("Kardiologi", "Invärtesmedicinska specialiteter", "bas", BAS),
  specialty("Lungsjukdomar", "Invärtesmedicinska specialiteter", "bas", BAS),
  specialty(
    "Medicinsk gastroenterologi och hepatologi",
    "Invärtesmedicinska specialiteter",
    "bas",
    BAS,
  ),
  specialty("Njurmedicin", "Invärtesmedicinska specialiteter", "bas", BAS),

  // Kirurgiska specialiteter
  specialty("Anestesi och intensivvård", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Barn- och ungdomskirurgi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Handkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Kirurgi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Kärlkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Obstetrik och gynekologi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Ortopedi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Plastikkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Thoraxkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Urologi", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Ögonsjukdomar", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Öron-, näs- och halssjukdomar", "Kirurgiska specialiteter", "bas", BAS),
  specialty("Hörsel- och balansrubbningar", "Kirurgiska specialiteter", "gren", GREN),
  specialty("Röst- och talrubbningar", "Kirurgiska specialiteter", "gren", GREN),

  // Laboratoriemedicinska specialiteter
  specialty(
    "Klinisk immunologi och transfusionsmedicin",
    "Laboratoriemedicinska specialiteter",
    "bas",
    BAS,
  ),
  specialty("Klinisk kemi", "Laboratoriemedicinska specialiteter", "bas", BAS),
  specialty("Klinisk mikrobiologi", "Laboratoriemedicinska specialiteter", "bas", BAS),
  specialty("Klinisk patologi", "Laboratoriemedicinska specialiteter", "bas", BAS),

  // Neurologiska specialiteter
  specialty("Klinisk neurofysiologi", "Neurologiska specialiteter", "bas", BAS),
  specialty("Neurologi", "Neurologiska specialiteter", "bas", BAS),
  specialty("Neurokirurgi", "Neurologiska specialiteter", "bas", BAS),
  specialty("Rehabiliteringsmedicin", "Neurologiska specialiteter", "bas", BAS),

  // Psykiatriska specialiteter
  specialty("Barn- och ungdomspsykiatri", "Psykiatriska specialiteter", "bas", BAS),
  specialty("Psykiatri", "Psykiatriska specialiteter", "bas", BAS),
  specialty("Rättspsykiatri", "Psykiatriska specialiteter", "bas", BAS),

  // Tilläggsspecialiteter
  specialty("Allergologi", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Arbetsmedicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Beroendemedicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Gynekologisk onkologi", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Nuklearmedicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Palliativ medicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Skolhälsovård", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Smärtlindring", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Vårdhygien", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  specialty("Äldrepsykiatri", "Tilläggsspecialiteter", "tillagg", TILLAGG),
];

export const DEFAULT_SPECIALTY_ID = RADIOLOGI.id;

const BY_ID = new Map(SPECIALTIES.map((s) => [s.id, s]));

export function getSpecialty(id: string | undefined | null): Specialty | undefined {
  if (!id) return undefined;
  return BY_ID.get(id);
}

/** Ordnad lista av grupper i den ordning de ska visas. */
export const SPECIALTY_GROUP_ORDER: SpecialtyGroup[] = [
  "Bild- och funktionsmedicinska specialiteter",
  "Barn- och ungdomsmedicinska specialiteter",
  "Enskilda basspecialiteter",
  "Invärtesmedicinska specialiteter",
  "Kirurgiska specialiteter",
  "Laboratoriemedicinska specialiteter",
  "Neurologiska specialiteter",
  "Psykiatriska specialiteter",
  "Tilläggsspecialiteter",
];

/** Specialiteter grupperade och i visningsordning. */
export function specialtiesByGroup(): { group: SpecialtyGroup; items: Specialty[] }[] {
  return SPECIALTY_GROUP_ORDER.map((group) => ({
    group,
    items: SPECIALTIES.filter((s) => s.group === group),
  })).filter((g) => g.items.length > 0);
}
