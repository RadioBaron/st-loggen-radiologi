// Vitest-konfiguration. Separat från app-bygget (vite.config.ts) eftersom den
// inte ska dra in TanStack Start-/Nitro-pluginsen – bara path-alias (@/) och en
// jsdom-miljö för hook-/komponenttester.
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
