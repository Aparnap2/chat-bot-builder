import { redirect } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";

export async function requireAuth(request: Request) {
  const { isAuthenticated, getUser } = await getKindeSession(request);
  if (!(await isAuthenticated())) {
    throw redirect("/login");
  }
  const user = await getUser();
  return user;
}