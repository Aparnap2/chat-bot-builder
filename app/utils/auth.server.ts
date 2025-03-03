import { redirect } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { User } from "~/types/types";

export async function requireAuth(request: Request): Promise<User> {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  if (!(await isAuthenticated())) {
    throw redirect("/login");
  }
  const user = await getUser();
  if (!user || !user.email) {
    throw redirect("/login");
  }
  return user as User;
}