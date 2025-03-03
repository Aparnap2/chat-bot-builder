import { json, LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/utils/prisma.server";
import { requireAuth } from "~/utils/auth.server";
import { generateEmbedCode } from "~/utils/embed.server";
import { Logger } from "~/utils/logger.server";
import { ChatSettings, EmbedCode } from "~/types/types";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireAuth(request);
  const chatbot = await prisma.chatbot.findFirst({
    where: { id: params.id, userId: user.id },
    include: { settings: true },
  });

  if (!chatbot || !chatbot.settings) {
    Logger.warn("Chatbot or settings not found", { chatbotId: params.id, userId: user.id });
    return json({ error: "Chatbot not found" }, { status: 404 });
  }

  const embedCode: EmbedCode = generateEmbedCode(chatbot.settings, chatbot.connectionString, chatbot.name);
  Logger.info("Embed code generated", { chatbotId: params.id });
  return json(embedCode);
};