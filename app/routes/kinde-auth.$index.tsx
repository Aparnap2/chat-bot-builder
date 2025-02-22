// app/routes/kinde-auth.$index.tsx
import { handleAuth } from "@kinde-oss/kinde-remix-sdk";
import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/utils/prisma.server";
import { Logger } from "~/utils/logger.server";

async function upsertUser(user: any) {
  if (!user || !user.id) {
    Logger.error("No user data available in upsertUser");
    throw new Error("No user data available");
  }
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (existingUser) {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          email: user.email,
          name: user.name || user.given_name || "",
        },
      });
    } else {
      await prisma.user.create({
        data: {
          kindeId: user.id,
          email: user.email,
          name: user.name || user.given_name || "",
        },
      });
    }
    // Store user data in local storage after upsert
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name || user.given_name || "",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    Logger.info("User upserted and stored in local storage", { userId: user.id, email: user.email });
  } catch (error) {
    Logger.error("Error saving user to database", { error });
    throw error;
  }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  return await handleAuth(request, params.index, {
    async onRedirectCallback({ user }) {
      await upsertUser(user);
    },
  });
}

export async function action({ params, request }: LoaderFunctionArgs) {
  return await handleAuth(request, params.index, {
    async onRedirectCallback({ user }) {
      await upsertUser(user);
    },
  });
}