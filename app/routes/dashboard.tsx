import { json, redirect, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { PlusIcon } from "lucide-react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";

import { getUserMetrics } from "~/utils/usage.server";

interface LoaderData {
  chatbots: Array<{ id: string; name: string; createdAt: Date; connectionString: string }>;
  metrics: { totalMessages: number; totalConversations: number; chatbotCount: number };
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  if (!user) throw redirect("/login");

  const chatbots = await prisma.chatbot.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, createdAt: true, connectionString: true },
  });

  const metrics = await getUserMetrics(user.id);

  return json<LoaderData>({ chatbots, metrics });
};

export default function Dashboard() {
  const { chatbots, metrics } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
     
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-400">Chatbots</p>
            <p className="text-2xl font-bold">{metrics.chatbotCount}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-400">Total Messages</p>
            <p className="text-2xl font-bold">{metrics.totalMessages}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-400">Conversations</p>
            <p className="text-2xl font-bold">{metrics.totalConversations}</p>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Chatbots</h2>
            <Link to="/chatbot/new" className="btn btn-primary flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> New Chatbot
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-gray-400">
                  <th>Name</th>
                  <th>Created</th>
                  <th>API Key</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chatbots.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500">
                      No chatbots yet. Create one above!
                    </td>
                  </tr>
                ) : (
                  chatbots.map((bot) => (
                    <tr key={bot.id}>
                      <td>{bot.name}</td>
                      <td>{new Date(bot.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-ghost font-mono truncate max-w-[120px]">{bot.connectionString}</span>
                      </td>
                      <td>
                        <Link to={`/chatbot/${bot.id}`} className="btn btn-ghost btn-sm mr-2">Manage</Link>
                        <Link to={`/chatbot/${bot.id}/customize`} className="btn btn-ghost btn-sm">Customize</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}