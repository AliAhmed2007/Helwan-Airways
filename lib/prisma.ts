import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const password = parsed.password ? decodeURIComponent(parsed.password) : "";
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: parsed.username || "root",
    password,
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 10,
    allowPublicKeyRetrieval: true,
    connectTimeout: 10000,
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL environment variable is not set.");

  const adapter = new PrismaMariaDb(parseDatabaseUrl(dbUrl));
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;