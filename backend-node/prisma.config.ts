import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";
import path from "path";

// Load .env.local from the root directory
dotenv.config({ path: path.resolve(process.cwd(), "../.env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});