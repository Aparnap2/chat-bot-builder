import { useState } from "react";
import { Form, Link, useLoaderData, json, redirect } from "@remix-run/react";
import { toast } from "react-hot-toast";

export const loader = async ({ request }: { request: Request }) => {
  const userId = request.headers.get("x-user-id");
  if (!userId) throw redirect("/login");
  const res = await fetch(`${new URL(request.url).origin}/api/chatbot`, {
    headers: { "x-user-id": userId },
  });
  const chatbots = await res.json();
  return json({ chatbots });
};

const ChatbotPage = () => {
  const { chatbots } = useLoaderData<typeof loader>();
  const [name, setName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "your-user-id", // Replace with actual user ID from session
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create chatbot");
      toast.success("Chatbot created!");
      setName("");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error creating chatbot");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Chatbot Builder</h2>
      <Form onSubmit={handleCreate} className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Chatbot Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 border px-4 py-2 rounded"
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
          Create
        </button>
      </Form>
      <h3 className="text-2xl font-semibold mb-2">Your Chatbots</h3>
      <ul className="space-y-2">
        {chatbots.map((bot: any) => (
          <li key={bot.id} className="border p-4 rounded bg-white">
            <div className="font-bold text-xl">{bot.name}</div>
            <div className="text-sm text-gray-600">Key: {bot.connectionString}</div>
          </li>
        ))}
      </ul>
      <Link to="/cpanel" className="mt-4 inline-block text-primary hover:underline">
        Back to Control Panel
      </Link>
    </div>
  );
};

export default ChatbotPage;
