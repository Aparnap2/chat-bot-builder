import { json, redirect, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { PlusIcon } from "lucide-react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { User } from "~/types/types";

interface LoaderData {
  user: { email: string; name: string };
  chatbots: Array<{
    id: string;
    name: string;
    createdAt: string;
    connectionString: string;
  }>;
  metrics: {
    totalMessages: number;
    totalConversations: number;
    chatbotCount: number;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser() as User | null;
  if (!user) throw redirect("/login");

  const chatbots = await prisma.chatbot.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, createdAt: true, connectionString: true },
  });

  const chatbotIds = chatbots.map((c) => c.id);
  const totalMessages = await prisma.message.count({
    where: { conversation: { chatbotId: { in: chatbotIds } } },
  });
  const totalConversations = await prisma.conversation.count({
    where: { chatbotId: { in: chatbotIds } },
  });

  return json<LoaderData>({
    user: { email: user.email, name: user.given_name || user.email },
    chatbots: chatbots.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    metrics: { totalMessages, totalConversations, chatbotCount: chatbots.length },
  });
};

export default function Dashboard() {
  const { user, chatbots, metrics } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Chatbots</div>
              <div className="stat-value">{metrics.chatbotCount}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Total Messages</div>
              <div className="stat-value">{metrics.totalMessages}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Conversations</div>
              <div className="stat-value">{metrics.totalConversations}</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm mb-8">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Your Chatbots</h2>
              <Link to="/chatbot/new" className="btn btn-primary gap-2">
                <PlusIcon className="w-4 h-4" />
                New Chatbot
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="hidden md:table-cell">Created</th>
                    <th>API Key</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chatbots.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        No chatbots yet. Create one above!
                      </td>
                    </tr>
                  ) : (
                    chatbots.map((bot) => (
                      <tr key={bot.id}>
                        <td>{bot.name}</td>
                        <td className="hidden md:table-cell">
                          {new Date(bot.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="badge badge-ghost font-mono truncate max-w-[120px]">
                            {bot.connectionString}
                          </div>
                        </td>
                        <td>
                          <Link to={`/chatbot/${bot.id}`} className="btn btn-ghost btn-xs mr-2">
                            Manage
                          </Link>
                          <Link to={`/chatbot/${bot.id}/customize`} className="btn btn-ghost btn-xs">
                            Customize
                          </Link>
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
    </div>
  );
}