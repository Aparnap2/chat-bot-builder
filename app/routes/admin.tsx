import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// For demo, assume admin is determined by an "x-admin" header.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const isAdmin = request.headers.get("x-admin") === "true";
  if (!isAdmin) throw redirect("/");
  
  const metrics = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    activeChatbots: await Promise.resolve(42), // Placeholder value.
  };
  return json({ metrics });
};

const Admin = () => {
  const { metrics } = useLoaderData<typeof loader>();
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">Admin Dashboard - Process Monitoring</h2>
      <p>Uptime: {metrics.uptime.toFixed(2)} seconds</p>
      <p>Memory Usage: {JSON.stringify(metrics.memoryUsage)}</p>
      <p>Active Chatbots: {metrics.activeChatbots}</p>
    </div>
  );
};

export default Admin;
