import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { prisma } from "~/utils/prisma.server";
import { useLoaderData, Link } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUser, headers } = await getKindeSession(request);
  const sessionUser = await getUser();
  if (!sessionUser) {
    throw redirect("/login", { headers });
  }
  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
  });
  if (!user) {
    throw redirect("/register", { headers });
  }
  return json({ user }, { headers });
};

const CPanel = () => {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">Control Panel</h2>
      <p>Welcome, {user.name || user.email}</p>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link to="/chatbot" className="text-primary hover:text-primary-hover">
              Chatbot Builder
            </Link>
          </li>
          {/* You can add additional navigation items here */}
        </ul>
      </nav>
    </div>
  );
};

export default CPanel;
