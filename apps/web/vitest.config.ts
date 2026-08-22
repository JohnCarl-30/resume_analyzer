import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Playwright owns e2e/; vitest must not try to run browser tests.
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "e2e/**"],
    // Property tests render a real component on every fast-check iteration, so
    // the 5s default is unreachable for them on a loaded CI runner. This raises
    // the ceiling without weakening any assertion.
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
