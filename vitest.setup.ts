// Körs före varje testfil. Rensar localStorage så testerna inte läcker tillstånd
// mellan sig (appen lagrar allt i localStorage).
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
