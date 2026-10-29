import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(projectDirectory, "tests/empty-module.ts"),
      "@": path.resolve(projectDirectory, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      include: ["src/lib/analysis/scoring.ts", "src/lib/analysis/schema.ts"],
    },
  },
});
