// app/utils/auth.server.ts
import { redirect } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { User } from "~/types/types"; // Assuming User type is defined in types.ts

export async function requireAuth(request: Request): Promise<User> {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  if (!(await isAuthenticated())) {
    throw redirect("/login");
  }
  const user = await getUser();
  if (!user || !user.email) {
    throw redirect("/login"); // Ensure user is not null and has an email
  }
  return user as unknown as User; // Cast to User type, ensuring non-null
}