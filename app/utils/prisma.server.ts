import { PrismaClient } from "@prisma/client";
import { env } from "~/config/env";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
});

if (env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;