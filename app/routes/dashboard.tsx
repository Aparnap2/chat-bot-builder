import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import  prisma  from "~/utils/prisma.server";
import { useLoaderData, Link } from "@remix-run/react";
import { toast } from "react-hot-toast";
import CustomizationPanel from "./customization";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUser, headers } = await getKindeSession(request);
  const sessionUser = await getUser();
  if (!sessionUser) {
    throw redirect("/login", { headers });
  }
  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
  });
  if (!user) throw redirect("/login", { headers });
  const chatbots = await prisma.chatbot.findMany({
    where: { ownerId: user.id },
  });
  const chatbotCount = chatbots.length;
  const uniqueApiKey = `API-${user.id.slice(-6)}`;
  return json({ user, chatbots, chatbotCount, uniqueApiKey }, { headers });
};

const Dashboard = () => {
  const { user, chatbots, chatbotCount, uniqueApiKey } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div>
          <span className="text-sm text-gray-600">Logged in as {user.email}</span>
          <Link to="/profile" className="ml-4 text-primary hover:underline">
            Profile
          </Link>
        </div>
      </header>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Chatbot History</h2>
        {chatbots.length === 0 ? (
          <p>You haven't built any chatbots yet.</p>
        ) : (
          <ul className="space-y-2">
            {chatbots.map((bot: any) => (
              <li key={bot.id} className="p-4 bg-white shadow rounded">
                <h3 className="text-xl font-bold">{bot.name}</h3>
                <p className="text-gray-600">Connection Key: {bot.connectionString}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
        <div className="p-4 bg-white shadow rounded">
          <p>Total Chatbots: {chatbotCount}</p>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your API Key</h2>
        <div className="p-4 bg-white shadow rounded">
          <p className="font-mono text-lg">{uniqueApiKey}</p>
          <p className="text-sm text-gray-500">
            Use this key for accessing your personalized API.
          </p>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Customize Your Chatbot</h2>
        <CustomizationPanel />
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Code Snippet Example</h2>
        <div className="p-4 bg-gray-800 text-green-300 font-mono rounded">
          <pre>{`
  // Example API call using your unique API key
  fetch("https://api.yourservice.com/chatbot", {
    headers: { "Authorization": "Bearer ${uniqueApiKey}" }
  })
    .then(res => res.json())
    .then(data => console.log(data));
          `}</pre>
        </div>
      </section>
      <section>
        <Link to="/cpanel" className="text-primary hover:underline">
          Back to Control Panel
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
