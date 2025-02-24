import { redis, rateLimiter } from "./redis.server";
import prisma from "./prisma.server";
import { Logger } from "./logger.server";

export async function trackUsage(chatbotId: string, userId: string) {
  const key = `usage:${userId}:${chatbotId}`;
  try {
    await redis.incr(key);
    Logger.info(`Tracked message for chatbot ${chatbotId} by user ${userId}`);
  } catch (err) {
    Logger.error("Failed to track usage in Redis", { error: err });
  }

  await prisma.message.create({
    data: {
      content: "Usage tracked",
      role: "system",
      conversation: { connect: { id: (await prisma.conversation.findFirst({ where: { chatbotId } }))?.id } },
    },
  });
}

export async function getUserMetrics(userId: string) {
  const chatbots = await prisma.chatbot.findMany({ where: { userId } });
  const chatbotIds = chatbots.map((c) => c.id);

  const totalMessages = await prisma.message.count({
    where: { conversation: { chatbotId: { in: chatbotIds } } },
  });
  const totalConversations = await prisma.conversation.count({
    where: { chatbotId: { in: chatbotIds } },
  });

  return { totalMessages, totalConversations, chatbotCount: chatbots.length };
}

export async function checkRateLimit(userId: string) {
  const { success, remaining } = await rateLimiter.limit(userId);
  return { success, remaining };
}