import { describe, it, expect } from "vitest";
import { StrictMode, type ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";

import { useLocalState, readStorage } from "./storage";

// Rendera hooken i StrictMode – det är där den gamla buggen syntes: en
// sidoeffekt inne i state-updatern kördes två gånger och skapade dubbletter.
const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;

describe("useLocalState", () => {
  it("persisterar uppdateringar till localStorage", () => {
    const { result } = renderHook(() => useLocalState("namn", ""), { wrapper });
    act(() => result.current[1]("Walter"));
    expect(result.current[0]).toBe("Walter");
    expect(readStorage("namn", "")).toBe("Walter");
  });

  it("funktionell uppdatering ser senaste värdet", () => {
    const { result } = renderHook(() => useLocalState<number>("n", 0), { wrapper });
    act(() => result.current[1]((prev) => prev + 1));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
  });

  // Regression: ett anrop till update() får bara lägga till EN post, även i
  // StrictMode. Tidigare kördes updatern två gånger -> dubbla placeringar/kurser.
  it("kör en funktionell uppdatering exakt en gång (ingen dubbel-submit)", () => {
    let calls = 0;
    const { result } = renderHook(() => useLocalState<string[]>("lista", []), {
      wrapper,
    });
    act(() => {
      result.current[1]((prev) => {
        calls += 1;
        return [...prev, "x"];
      });
    });
    expect(calls).toBe(1);
    expect(result.current[0]).toEqual(["x"]);
    expect(readStorage<string[]>("lista", [])).toEqual(["x"]);
  });

  it("synkar mellan flera komponenter som delar nyckel", () => {
    const a = renderHook(() => useLocalState<number>("delad", 0), { wrapper });
    const b = renderHook(() => useLocalState<number>("delad", 0), { wrapper });
    act(() => a.result.current[1](42));
    expect(b.result.current[0]).toBe(42);
  });
});
