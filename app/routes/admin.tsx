import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Assume admin access is determined by an "x-admin" header.
  const isAdmin = request.headers.get("x-admin") === "true";
  if (!isAdmin) throw redirect("/");
  const metrics = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    activeChatbots: 42, // placeholder value
  };
  return json({ metrics });
};

const Admin = () => {
  const { metrics } = useLoaderData<typeof loader>();
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
      <p>Uptime: {metrics.uptime.toFixed(2)} seconds</p>
      <p>Memory Usage: {JSON.stringify(metrics.memoryUsage)}</p>
      <p>Active Chatbots: {metrics.activeChatbots}</p>
    </div>
  );
};

export default Admin;
