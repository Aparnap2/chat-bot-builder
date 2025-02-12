// app/routes/profile.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { prisma } from "../utils/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUser, headers } = await getKindeSession(request);
  const sessionUser = await getUser();
  if (!sessionUser) {
    throw redirect("/login", { headers });
  }
  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
  });
  return json({ user }, { headers });
};

const Profile = () => {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div>
      <h2>Your Profile</h2>
      <p>Email: {user.email}</p>
      <p>Name: {user.name}</p>
    </div>
  );
};

export default Profile;
