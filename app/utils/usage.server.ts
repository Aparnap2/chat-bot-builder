// app/utils/usage.server.ts
import { redis } from "./redis.server";
import prisma from "./prisma.server";
import { Logger } from "./logger.server";
import { AnalyticsData } from "~/types/types";

export async function trackUsage(chatbotId: string, action: "message" | "api_call") {
  const today = new Date().toISOString().split("T")[0];
  const key = `usage:${chatbotId}:${today}`;

  try {
    await redis.incr(`${key}:${action}`);
    Logger.info(`Tracked ${action} for chatbot ${chatbotId}`, { date: today });
  } catch (err) {
    Logger.error("Failed to track usage in Redis", { error: err, chatbotId });
  }

  // Persist to Prisma periodically (e.g., via cron job)
  await prisma.usage.upsert({
    where: { chatbotId_date: { chatbotId, date: today } },
    update: { [action]: { increment: 1 } },
    create: { chatbotId, date: today, [action]: 1, api_calls: 0, messages: 0 },
  });
}

export async function getUsage(chatbotId: string, days: number = 7): Promise<AnalyticsData["usage"]> {
  const usage = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const key = `usage:${chatbotId}:${dateStr}`;
    const messages = Number(await redis.get(`${key}:message`) || 0);
    usage.push({ date: dateStr, messages });
  }
  return usage;
}