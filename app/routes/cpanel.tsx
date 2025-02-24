// app/routes/cpanel.tsx
import { json, redirect, useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/utils/prisma.server";
import { Suspense, useState } from "react";
import { Settings, BarChart2, Bot, User, LogOut } from "lucide-react";
import { checkRateLimit } from "~/utils/usage.server";
import { Logger } from "~/utils/logger.server";
import { generateEmbedCode } from "~/utils/embed.server"; // Server-only import stays in loader
import { ChatSettings, EmbedCode } from "~/types/types";

interface ChatbotWithEmbed {
  id: string;
  name: string;
  connectionString: string;
  createdAt: string;
  settings: ChatSettings | null;
  embed: EmbedCode; // Embed codes generated server-side
}

interface CpanelLoaderData {
  user: { email: string; name: string | null; createdAt: string };
  chatbots: ChatbotWithEmbed[];
  analytics: {
    total_messages: number;
    total_conversations: number;
    usage: { date: string; messages: number }[];
  };
  error?: string;
}


// app/routes/cpanel.tsx (loader only)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const session = await getKindeSession(request);
    const userFromSession = await session.getUser();
    if (!userFromSession?.email) throw redirect("/login");

    const user = await prisma.user.findUnique({ where: { email: userFromSession.email } });
    if (!user) throw redirect("/register");

    const chatbotsRaw = await prisma.chatbot.findMany({
      where: { userId: user.id },
      include: { settings: true },
    });

    const chatbots: ChatbotWithEmbed[] = chatbotsRaw.map((c) => {
      const settings = c.settings
        ? {
            ...c.settings,
            quickReplies: Array.isArray(c.settings.quickReplies)
              ? (c.settings.quickReplies as Array<{ text: string; action: string }>)
              : [],
          }
        : null;
      const embed = settings
        ? generateEmbedCode(settings, c.connectionString)
        : { react: "No settings", vanillaJs: "No settings" };
      return {
        id: c.id,
        name: c.name,
        connectionString: c.connectionString,
        createdAt: new Date(c.createdAt).toISOString(),
        settings,
        embed,
      };
    });
    let analytics = {
      total_messages: 0,
      total_conversations: 0,
      usage: [] as { date: string; messages: number }[],
    };
    if (chatbots.length > 0) {
      const chatbotIds = chatbots.map((c) => c.id);
      const totalMessages = await prisma.message.count({
        where: { conversation: { chatbotId: { in: chatbotIds } } },
      });
      const totalConversations = await prisma.conversation.count({
        where: { chatbotId: { in: chatbotIds } },
      });
      const usage = await Promise.all(chatbots.map((c) => checkRateLimit(c.id)));
      analytics = {
        total_messages: totalMessages,
        total_conversations: totalConversations,
        usage: usage.flat(),
      };
    }

    Logger.info("Cpanel loaded", { userId: user.id });
    return json<CpanelLoaderData>({
      user: { email: user.email, name: user.name, createdAt: new Date(user.createdAt).toISOString() },
      chatbots,
      analytics,
    });
  } catch (error) {
    Logger.error("Cpanel loader error", { error });
    return json<CpanelLoaderData>(
      {
        user: { email: "", name: null, createdAt: "" },
        chatbots: [],
        analytics: { total_messages: 0, total_conversations: 0, usage: [] },
        error: "Failed to load control panel",
      },
      { status: 500 }
    );
  }
};
const Cpanel = () => {
  const data = useLoaderData<CpanelLoaderData>();
  const [activeSection, setActiveSection] = useState<"overview" | "chatbots" | "settings">("overview");

  if (data.error) return <div className="p-4 text-red-500">{data.error}</div>;

  const { user, chatbots, analytics } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4 glass-card p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-12">
                <span className="text-xl">{user.name?.charAt(0) || user.email.charAt(0)}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name ?? "User"}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-2">
            {["overview", "chatbots", "settings"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section as any)}
                className={`neo-brutalism w-full flex items-center gap-2 px-4 py-2 rounded-xl ${
                  activeSection === section ? "bg-primary text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                {section === "overview" && <BarChart2 className="w-5 h-5" />}
                {section === "chatbots" && <Bot className="w-5 h-5" />}
                {section === "settings" && <Settings className="w-5 h-5" />}
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
            <form action="/logout" method="post">
              <button
                type="submit"
                className="neo-brutalism w-full flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </form>
          </nav>
        </div>

        {/* Main Panel */}
        <div className="md:w-3/4 glass-card p-6 rounded-2xl shadow-xl">
          {activeSection === "overview" && (
            <>
              <h1 className="text-3xl font-bold text-white mb-6">Control Panel Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="stats shadow bg-base-100">
                  <div className="stat">
                    <div className="stat-title">Active Chatbots</div>
                    <div className="stat-value">{chatbots.length}</div>
                  </div>
                </div>
                <div className="stats shadow bg-base-100">
                  <div className="stat">
                    <div className="stat-title">Total Messages</div>
                    <div className="stat-value">{analytics.total_messages}</div>
                  </div>
                </div>
                <div className="stats shadow bg-base-100">
                  <div className="stat">
                    <div className="stat-title">Conversations</div>
                    <div className="stat-value">{analytics.total_conversations}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Usage Over Last 7 Days</h3>
                <pre className="bg-base-200 p-4 rounded">{JSON.stringify(analytics.usage, null, 2)}</pre>
              </div>
            </>
          )}

          {activeSection === "chatbots" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Your Chatbots</h1>
                <Link to="/chatbot/new" className="btn btn-primary gap-2">
                  <Bot className="w-5 h-5" />
                  New Chatbot
                </Link>
              </div>
              <Suspense fallback={<div className="skeleton h-32 w-full"></div>}>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Created</th>
                        <th>API Key</th>
                        <th>Embed Code</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chatbots.map((bot) => (
                        <tr key={bot.id}>
                          <td>{bot.name}</td>
                          <td>{new Date(bot.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="badge badge-ghost font-mono truncate max-w-[120px]">{bot.connectionString}</div>
                          </td>
                          <td>
                            <details className="dropdown">
                              <summary className="btn btn-xs">Show</summary>
                              <ul className="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-64">
                                <li>
                                  <details>
                                    <summary>React</summary>
                                    <pre className="text-xs whitespace-pre-wrap">{bot.embed.react}</pre>
                                  </details>
                                </li>
                                <li>
                                  <details>
                                    <summary>Vanilla JS</summary>
                                    <pre className="text-xs whitespace-pre-wrap">{bot.embed.vanillaJs}</pre>
                                  </details>
                                </li>
                              </ul>
                            </details>
                          </td>
                          <td>
                            <Link to={`/chatbot/${bot.id}`} className="btn btn-ghost btn-xs">Manage</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Suspense>
            </>
          )}

          {activeSection === "settings" && (
            <>
              <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text text-white">Email</span></label>
                  <input type="email" value={user.email} disabled className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text text-white">Name</span></label>
                  <input type="text" value={user.name ?? ""} disabled className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text text-white">Account Created</span></label>
                  <input type="text" value={new Date(user.createdAt).toLocaleDateString()} disabled className="input input-bordered w-full" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cpanel;