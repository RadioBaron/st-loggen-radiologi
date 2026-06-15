import { describe, it, expect } from "vitest";

import { validateBackup, ProfileSchema } from "./validation";

function envelope(data: unknown, version = 1) {
  return { app: "st-radiologi", version, exportedAt: "2026-06-15T00:00:00Z", data };
}

describe("validateBackup – avvisar trasiga filer", () => {
  it("avvisar icke-objekt", () => {
    expect(() => validateBackup(null)).toThrow(/den här appen/);
    expect(() => validateBackup("text")).toThrow(/den här appen/);
  });

  it("avvisar fil från annan app", () => {
    expect(() => validateBackup({ app: "annat", version: 1, data: {} })).toThrow(/den här appen/);
  });

  it("avvisar ogiltig version", () => {
    expect(() => validateBackup(envelope({}, 0))).toThrow();
    expect(() => validateBackup(envelope({}, -1))).toThrow();
    expect(() => validateBackup(envelope({}, 1.5))).toThrow();
  });

  it("avvisar schema som inte är en lista", () => {
    expect(() => validateBackup(envelope({ schedule: { foo: 1 } }))).toThrow();
  });

  it("avvisar placering utan id", () => {
    expect(() => validateBackup(envelope({ schedule: [{ department: "Thorax" }] }))).toThrow();
  });

  it("avvisar kurs utan id", () => {
    expect(() =>
      validateBackup(envelope({ courses: [{ name: "Kurs", certificate: false, credits: {} }] })),
    ).toThrow();
  });
});

describe("validateBackup – accepterar och reparerar giltig data", () => {
  it("accepterar en tom men välformad backup", () => {
    const { version, data } = validateBackup(envelope({}));
    expect(version).toBe(1);
    expect(data).toBeDefined();
  });

  it("tillåter null/saknade sektioner", () => {
    const { data } = validateBackup(envelope({ milestones: null, schedule: null }));
    expect(data.milestones).toBeNull();
  });

  it("accepterar en komplett giltig backup", () => {
    const { data } = validateBackup(
      envelope({
        specialty: "radiologi",
        milestones: { c5: true },
        schedule: [
          {
            id: "a",
            department: "Thorax",
            startDate: "2024-01-01",
            endDate: "2024-04-01",
            months: 3,
          },
        ],
        courses: [{ id: "k1", name: "Kurs", certificate: true, credits: { c5: 1 } }],
        supervision: [],
        profile: { name: "Walter", goalMonths: 60 },
        application: { blankett: true },
      }),
    );
    expect(data.specialty).toBe("radiologi");
    expect(data.schedule).toHaveLength(1);
    expect(data.courses?.[0].credits).toEqual({ c5: 1 });
  });

  it("reparerar profil med saknade fält till standardvärden", () => {
    const { data } = validateBackup(envelope({ profile: { name: "Walter" } }));
    expect(data.profile?.name).toBe("Walter");
    expect(data.profile?.goalMonths).toBe(60);
    expect(data.profile?.region).toBe("");
  });

  it("behåller okända fält (framtidssäkring)", () => {
    const parsed = ProfileSchema.parse({ name: "W", framtidaFält: 123 });
    expect((parsed as Record<string, unknown>).framtidaFält).toBe(123);
  });

  it("kokar ihop trasiga enskilda fält men behåller posten", () => {
    // certificate fel typ -> false; credits saknas -> {}
    const { data } = validateBackup(
      envelope({
        courses: [{ id: "k1", name: "Kurs", certificate: "ja" as unknown }],
      }),
    );
    expect(data.courses?.[0].certificate).toBe(false);
    expect(data.courses?.[0].credits).toEqual({});
  });
});
