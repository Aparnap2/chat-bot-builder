import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const user = await requireAuth(request);
//   const isAdmin = user.email === "admin@example.com"; // Example admin check
//   if (!isAdmin) throw redirect("/", { status: 403 });
//   const metrics = {
//     uptime: process.uptime(),
//     memoryUsage: process.memoryUsage(),
//     activeChatbots: 42, // Placeholder value
//   };
//   return json({ metrics });
// };

const Admin = () => {
  // const { metrics } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background/95 to-background/90 p-8">
      
        <iframe src="https://www.ChatStream.org/embed" width="100%" height="600px" frameBorder="0"></iframe>
      </div>
  
  );
};

export default Admin;