// app/routes/logout.tsx (create if it doesn’t exist)
import { redirect, ActionFunction } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { Logger } from "~/utils/logger.server";

export const action: ActionFunction = async ({ request }) => {
  const { logout } = await getKindeSession(request);
  await logout();
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
  Logger.info("User logged out and local storage cleared");
  return redirect("/");
};

export default function Logout() {
  return null; // This route only handles the action
}