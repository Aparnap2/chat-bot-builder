// app/routes/kinde-auth.$index.tsx
import { handleAuth } from "@kinde-oss/kinde-remix-sdk";
import type { LoaderFunctionArgs } from "@remix-run/node";
import  prisma  from "~/utils/prisma.server";

async function upsertUser(user: any) {
  if (!user || !user.id) {
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
          name: user.name || "",
        },
      });
    } else {
      await prisma.user.create({
        data: {
          kindeId: user.id,
          email: user.email,
          name: user.name || "",
        },
      });
    }
  } catch (error) {
    console.error("Error saving user to database:", error);
    throw error;
  }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  return await handleAuth(request, params.index, {
    async onRedirectCallback({ user }: { user: { id: string; email: string; name?: string } }) {
      await upsertUser(user);
    },
  });
}

export async function action({ params, request }: LoaderFunctionArgs) {
  return await handleAuth(request, params.index, {
    async onRedirectCallback({ user }: { user: { id: string; email: string; name?: string } }) {
      await upsertUser(user);
    },
  });
}
