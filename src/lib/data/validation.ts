// Zod-validering av all användardata. Används vid import av backup-filer (där
// innehållet kan vara korrupt, manipulerat eller komma från en annan app) och
// kan återanvändas för att sanera data som läses från disk.
//
// Filosofi: tappa aldrig användardata i onödan. Saknade eller felaktiga
// enskilda fält repareras med säkra standardvärden (.catch), och okända fält
// behålls (.passthrough) så framtida fält överlever en runt-tur. Bara när den
// grundläggande formen är fel (t.ex. att schemat inte är en lista, eller att en
// post saknar id) avvisas importen – och då med ett tydligt felmeddelande i
// stället för att tyst skriva skräp.

import { z } from "zod";

// --- Enskilda sektioner -----------------------------------------------------

export const ProfileSchema = z
  .object({
    name: z.string().catch(""),
    specialty: z.string().catch(""),
    region: z.string().catch(""),
    clinic: z.string().catch(""),
    licenseDate: z.string().catch(""),
    startDate: z.string().catch(""),
    supervisor: z.string().catch(""),
    studyDirector: z.string().catch(""),
    headOfDept: z.string().catch(""),
    goalMonths: z.number().catch(60),
  })
  .passthrough();

export const ScheduleEntrySchema = z
  .object({
    id: z.string().min(1),
    department: z.string().min(1),
    customName: z.string().optional(),
    startDate: z.string().catch(""),
    endDate: z.string().catch(""),
    months: z.number().catch(0),
    notes: z.string().optional(),
    startMonth: z.string().optional(),
  })
  .passthrough();
export const ScheduleSchema = z.array(ScheduleEntrySchema);

export const CourseSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    date: z.string().catch(""),
    location: z.string().optional(),
    url: z.string().optional(),
    certificate: z.boolean().catch(false),
    credits: z.record(z.number()).catch({}),
    notes: z.string().optional(),
    done: z.boolean().optional(),
  })
  .passthrough();
export const CoursesSchema = z.array(CourseSchema);

export const SupervisionSessionSchema = z
  .object({
    id: z.string().min(1),
    date: z.string(),
    supervisor: z.string().catch(""),
    location: z.string().optional(),
    answers: z.record(z.string()).catch({}),
    createdAt: z.string().catch(""),
    updatedAt: z.string().catch(""),
  })
  .passthrough();
export const SupervisionSchema = z.array(SupervisionSessionSchema);

export const MilestonesSchema = z.record(z.boolean());
export const ApplicationSchema = z.record(z.boolean());
export const SpecialtySchema = z.string();

// --- Backup-envelope --------------------------------------------------------

// Varje sektion får vara null/saknas (backupen lagrar null för tomma nycklar).
const nullableOptional = <T extends z.ZodTypeAny>(s: T) => s.nullable().optional();

export const BackupDataSchema = z
  .object({
    specialty: nullableOptional(SpecialtySchema),
    milestones: nullableOptional(MilestonesSchema),
    schedule: nullableOptional(ScheduleSchema),
    courses: nullableOptional(CoursesSchema),
    supervision: nullableOptional(SupervisionSchema),
    profile: nullableOptional(ProfileSchema),
    application: nullableOptional(ApplicationSchema),
  })
  .passthrough();

export const BackupEnvelopeSchema = z.object({
  app: z.literal("st-radiologi"),
  version: z.number().int().positive(),
  exportedAt: z.string().optional(),
  data: BackupDataSchema,
});

export type BackupData = z.infer<typeof BackupDataSchema>;

// --- Publik validerings-API -------------------------------------------------

/** Gör ett zod-fel till ett läsbart svenskt meddelande. */
function humanizeError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Innehållet kunde inte tolkas.";
  const path = first.path.join(" › ");
  return path ? `Fel i "${path}": ${first.message}` : first.message;
}

export type ValidatedBackup = { version: number; data: BackupData };

/**
 * Validerar en redan JSON-tolkad backup. Returnerar version + validerad
 * (reparerad) data, eller kastar ett tydligt fel. Skriver ingenting.
 */
export function validateBackup(parsed: unknown): ValidatedBackup {
  // Vänligt meddelande för det vanligaste felet: fel/främmande fil.
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { app?: unknown }).app !== "st-radiologi"
  ) {
    throw new Error("Filen verkar inte komma från den här appen.");
  }

  const result = BackupEnvelopeSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(humanizeError(result.error));
  }
  return { version: result.data.version, data: result.data.data };
}
