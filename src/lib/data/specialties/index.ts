// Register över alla specialiteter enligt Socialstyrelsens målbeskrivningar
// (HSLF-FS 2021:8). Specialiteter med inlagda delmål (`categories`) kan väljas
// och användas fullt ut. Övriga visas som "kommer snart" tills deras delmål
// lagts in – lägg bara till en datamodul och referera den här.

import type { Specialty, SpecialtyGroup, SpecialtyType } from "./types";
import { RADIOLOGI } from "./radiologi";

export type {
  Specialty,
  SpecialtyGroup,
  SpecialtyType,
  Milestone,
  MilestoneCategory,
} from "./types";
export { isSpecialtyReady, allMilestonesOf } from "./types";

// Hjälpare för att deklarera ännu ej inlagda specialiteter kompakt.
function planned(
  name: string,
  group: SpecialtyGroup,
  type: SpecialtyType,
  goalMonths: number,
): Specialty {
  return {
    id: name
      .toLowerCase()
      .replace(/[åä]/g, "a")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    name,
    group,
    type,
    goalMonths,
  };
}

const BAS = 60;
const GREN = 30;
const TILLAGG = 24;

export const SPECIALTIES: Specialty[] = [
  // Bild- och funktionsmedicinska specialiteter
  RADIOLOGI,
  planned("Klinisk fysiologi", "Bild- och funktionsmedicinska specialiteter", "bas", BAS),
  planned("Neuroradiologi", "Bild- och funktionsmedicinska specialiteter", "gren", GREN),

  // Barn- och ungdomsmedicinska specialiteter
  planned("Barn- och ungdomsmedicin", "Barn- och ungdomsmedicinska specialiteter", "bas", BAS),
  planned(
    "Barn- och ungdomsallergologi",
    "Barn- och ungdomsmedicinska specialiteter",
    "gren",
    GREN,
  ),
  planned(
    "Barn- och ungdomshematologi och onkologi",
    "Barn- och ungdomsmedicinska specialiteter",
    "gren",
    GREN,
  ),
  planned("Barn- och ungdomskardiologi", "Barn- och ungdomsmedicinska specialiteter", "gren", GREN),
  planned(
    "Barn- och ungdomsneurologi med habilitering",
    "Barn- och ungdomsmedicinska specialiteter",
    "gren",
    GREN,
  ),
  planned("Neonatologi", "Barn- och ungdomsmedicinska specialiteter", "gren", GREN),

  // Enskilda basspecialiteter
  planned("Akutsjukvård", "Enskilda basspecialiteter", "bas", BAS),
  planned("Allmänmedicin", "Enskilda basspecialiteter", "bas", BAS),
  planned("Arbets- och miljömedicin", "Enskilda basspecialiteter", "bas", BAS),
  planned("Hud- och könssjukdomar", "Enskilda basspecialiteter", "bas", BAS),
  planned("Infektionssjukdomar", "Enskilda basspecialiteter", "bas", BAS),
  planned("Klinisk farmakologi", "Enskilda basspecialiteter", "bas", BAS),
  planned("Klinisk genetik", "Enskilda basspecialiteter", "bas", BAS),
  planned("Onkologi", "Enskilda basspecialiteter", "bas", BAS),
  planned("Reumatologi", "Enskilda basspecialiteter", "bas", BAS),
  planned("Rättsmedicin", "Enskilda basspecialiteter", "bas", BAS),
  planned("Socialmedicin", "Enskilda basspecialiteter", "bas", BAS),

  // Invärtesmedicinska specialiteter
  planned("Endokrinologi och diabetologi", "Invärtesmedicinska specialiteter", "bas", BAS),
  planned("Geriatrik", "Invärtesmedicinska specialiteter", "bas", BAS),
  planned("Hematologi", "Invärtesmedicinska specialiteter", "bas", BAS),
  planned("Internmedicin", "Invärtesmedicinska specialiteter", "bas", BAS),
  planned("Kardiologi", "Invärtesmedicinska specialiteter", "bas", BAS),
  planned("Lungsjukdomar", "Invärtesmedicinska specialiteter", "bas", BAS),
  planned(
    "Medicinsk gastroenterologi och hepatologi",
    "Invärtesmedicinska specialiteter",
    "bas",
    BAS,
  ),
  planned("Njurmedicin", "Invärtesmedicinska specialiteter", "bas", BAS),

  // Kirurgiska specialiteter
  planned("Anestesi och intensivvård", "Kirurgiska specialiteter", "bas", BAS),
  planned("Barn- och ungdomskirurgi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Handkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Kirurgi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Kärlkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Obstetrik och gynekologi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Ortopedi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Plastikkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Thoraxkirurgi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Urologi", "Kirurgiska specialiteter", "bas", BAS),
  planned("Ögonsjukdomar", "Kirurgiska specialiteter", "bas", BAS),
  planned("Öron-, näs- och halssjukdomar", "Kirurgiska specialiteter", "bas", BAS),
  planned("Hörsel- och balansrubbningar", "Kirurgiska specialiteter", "gren", GREN),
  planned("Röst- och talrubbningar", "Kirurgiska specialiteter", "gren", GREN),

  // Laboratoriemedicinska specialiteter
  planned(
    "Klinisk immunologi och transfusionsmedicin",
    "Laboratoriemedicinska specialiteter",
    "bas",
    BAS,
  ),
  planned("Klinisk kemi", "Laboratoriemedicinska specialiteter", "bas", BAS),
  planned("Klinisk mikrobiologi", "Laboratoriemedicinska specialiteter", "bas", BAS),
  planned("Klinisk patologi", "Laboratoriemedicinska specialiteter", "bas", BAS),

  // Neurologiska specialiteter
  planned("Klinisk neurofysiologi", "Neurologiska specialiteter", "bas", BAS),
  planned("Neurologi", "Neurologiska specialiteter", "bas", BAS),
  planned("Neurokirurgi", "Neurologiska specialiteter", "bas", BAS),
  planned("Rehabiliteringsmedicin", "Neurologiska specialiteter", "bas", BAS),

  // Psykiatriska specialiteter
  planned("Barn- och ungdomspsykiatri", "Psykiatriska specialiteter", "bas", BAS),
  planned("Psykiatri", "Psykiatriska specialiteter", "bas", BAS),
  planned("Rättspsykiatri", "Psykiatriska specialiteter", "bas", BAS),

  // Tilläggsspecialiteter
  planned("Allergologi", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Arbetsmedicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Beroendemedicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Gynekologisk onkologi", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Nuklearmedicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Palliativ medicin", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Skolhälsovård", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Smärtlindring", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Vårdhygien", "Tilläggsspecialiteter", "tillagg", TILLAGG),
  planned("Äldrepsykiatri", "Tilläggsspecialiteter", "tillagg", TILLAGG),
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
