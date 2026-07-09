import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",          // we're testing a Node/Express backend
    setupFiles: ["./tests/setup.js"], // runs before the tests (starts the DB)
    hookTimeout: 120000,          // give the in-memory DB time to download/start on first run
    fileParallelism: false,       // run test files one at a time (they share one DB)
  },
});