import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { rateLimiter } from "~/utils/redis.server";
import prisma from "~/utils/prisma.server";
import { generateResponse } from "~/utils/gemini.server";
import { Logger } from "~/utils/logger.server";
import { trackUsage } from "~/utils/usage.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) throw redirect("/login");

  const chatbot = await prisma.chatbot.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      settings: true,
      conversations: { include: { messages: { orderBy: { createdAt: "asc" } } } },
    },
  });

  if (!chatbot) {
    Logger.warn("Chatbot not found", { chatbotId: params.id, userId: user.id });
    throw json({ error: "Chatbot not found" }, { status: 404 });
  }

  return json(chatbot);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success, remaining } = await rateLimiter.limit(`${user.id}:${ip}`);
  if (!success) {
    Logger.warn("Rate limit exceeded", { userId: user.id, ip });
    return json({ error: "Too many requests", remaining }, { status: 429 });
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;

  switch (action) {
    case "sendMessage": {
      const conversationId = formData.get("conversationId") as string;
      const message = formData.get("message") as string;

      if (!conversationId || !message) {
        return json({ error: "Missing conversationId or message" }, { status: 400 });
      }

      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, chatbotId: params.id },
        include: { messages: true },
      });

      if (!conversation) {
        Logger.warn("Conversation not found", { conversationId, chatbotId: params.id });
        return json({ error: "Conversation not found" }, { status: 404 });
      }

      const userMessage = await prisma.message.create({
        data: { conversationId, content: message, role: "user" },
      });

      await trackUsage(params.id!, user.id);

      const context = conversation.messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const response = await generateResponse(message, context, user.id);

      const aiMessage = await prisma.message.create({
        data: { conversationId, content: response, role: "assistant" },
      });

      Logger.info("Message processed", { conversationId, userId: user.id });
      return json({ userMessage, aiMessage });
    }
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};