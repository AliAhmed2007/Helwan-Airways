import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client/index.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const DB_URL = process.env.DATABASE_URL ?? "";
function parseDbUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port) || 3306,
      user: u.username,
      password: u.password,
      database: u.pathname.replace("/", ""),
    };
  } catch {
    return { host: "localhost", port: 3306, user: "root", password: "", database: "helwan_airways" };
  }
}
const dbConfig = parseDbUrl(DB_URL);
const adapter = new PrismaMariaDb({ ...dbConfig, connectionLimit: 5, allowPublicKeyRetrieval: true });
const prisma = new PrismaClient({ adapter } as never);

async function check() {
  const all = await prisma.flight.count();
  const round = await prisma.flight.count({ where: { isRoundTrip: true } });
  console.log(`Total: ${all}, Round: ${round}`);
}
check().finally(() => prisma.$disconnect());
