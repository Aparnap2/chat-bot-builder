// app/routes/api/chatbot.$id.tsx
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { rateLimiter } from "~/utils/redis.server";
import prisma from "~/utils/prisma.server";
import { generateResponse } from "~/utils/gemini.server";

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
    throw json({ error: "Chatbot not found" }, { status: 404 });
  }

  return json(chatbot);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success, remaining } = await rateLimiter.limit(ip);
  if (!success) return json({ error: "Too many requests", remaining }, { status: 429 });

  const formData = await request.formData();
  const action = formData.get("action") as string;

  switch (action) {
    case "sendMessage": {
      const conversationId = formData.get("conversationId") as string;
      const message = formData.get("message") as string;

      if (!conversationId || !message) {
        return json({ error: "Missing conversationId or message" }, { status: 400 });
      }

      // Verify conversation exists and belongs to the chatbot
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, chatbotId: params.id },
        include: { messages: true },
      });

      if (!conversation) {
        return json({ error: "Conversation not found" }, { status: 404 });
      }

      const userMessage = await prisma.message.create({
        data: { conversationId, content: message, role: "user" },
      });

      const response = await generateResponse(
        message,
        conversation.messages.map((m: { role: any; content: any; }) => `${m.role}: ${m.content}`).join("\n")
      );
      const aiMessage = await prisma.message.create({
        data: { conversationId, content: response(), role: "assistant" },
      });

      return json({ userMessage, aiMessage });
    }
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};