import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://rudiment:rudiment_dev@localhost:5432/rudiment_db",
      JWT_ACCESS_SECRET: "a".repeat(64),
      JWT_REFRESH_SECRET: "b".repeat(64),
    },
  },
});
