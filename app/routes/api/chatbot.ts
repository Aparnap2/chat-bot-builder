import { redirect, LoaderFunctionArgs, ActionFunction, json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import { rateLimiter } from "~/utils/redis.server";
import { v4 as uuidv4 } from "uuid";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return json({ error: "Not authenticated" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!(await rateLimiter(ip))) return json({ error: "Rate limit exceeded" }, { status: 429 });
  
  const chatbots = await prisma.chatbot.findMany({
    where: { ownerId: userId },
  });
  return json(chatbots);
}

export const action: ActionFunction = async ({ request }) => {
  const userId = request.headers.get("x-user-id");
  if (!userId) return json({ error: "Not authenticated" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!(await rateLimiter(ip))) return json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await request.json();
  const { name } = body;
  if (!name) return json({ error: "Missing chatbot name" }, { status: 400 });
  
  const connectionString = uuidv4(); // Unique connection string for vector submissions.
  const chatbot = await prisma.chatbot.create({
    data: {
      name,
      connectionString,
      ownerId: userId,
    },
  });
  return json(chatbot);
};
