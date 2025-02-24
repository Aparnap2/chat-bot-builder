// app/routes/profile.tsx
import { useEffect } from "react";
import { json, redirect, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import prisma from "~/utils/prisma.server";
import { Settings, BarChart2 } from "lucide-react";


type LoaderData = {
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
  kindeUser: {
    id: string;
    given_name: string;
    family_name?: string;
    email: string;
    picture?: string | null;
  };
  userProfile: any;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUser, getUserProfile, isAuthenticated, headers } = await getKindeSession(request);

  if (!(await isAuthenticated())) {
    throw redirect("/login", { headers });
  }
  const sessionUser = await getUser();
  const userProfile = await getUserProfile();
  if (!sessionUser) {
    throw redirect("/login", { headers });
  }
  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
  });
  if (!user) {
    throw redirect("/register", { headers });
  }
  return json<LoaderData>({ user, kindeUser: sessionUser, userProfile }, { headers });
};

export default function Profile() {
  const { user, kindeUser, userProfile } = useLoaderData<LoaderData>();

  useEffect(() => {
    // Store user data in local storage after successful login
    const userData = {
      id: kindeUser.id,
      email: kindeUser.email,
      name: kindeUser.given_name || "",
    };
    localStorage.setItem("user", JSON.stringify(userData));
  
  }, [kindeUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      
      <div className="hidden lg:block absolute inset-0 overflow-hidden">
        <div className="parallax-layer absolute inset-0">
          <div className="cube-1"></div>
          <div className="cube-2"></div>
          <div className="cube-3"></div>
        </div>
      </div>
      <div className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div className="glass-card max-w-3xl mx-auto p-8 rounded-2xl mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  {kindeUser.picture && (
                    <img
                      src={kindeUser.picture}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-primary"
                    />
                  )}
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">
                      Welcome, {kindeUser.given_name || "User"}
                    </h2>
                    <p className="text-lg text-gray-400">
                      Manage your account and access tools to customize and analyze your chatbots.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700 py-2">
                  <span className="text-lg font-semibold text-white">Name</span>
                  <span className="text-lg text-gray-300">
                    {`${kindeUser.given_name} ${kindeUser.family_name || "Not provided"}`}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-700 py-2">
                  <span className="text-lg font-semibold text-white">Email</span>
                  <span className="text-lg text-gray-300">{kindeUser.email}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-700 py-2">
                  <span className="text-lg font-semibold text-white">Account Created</span>
                  <span className="text-lg text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-lg font-semibold text-white">Profile Status</span>
                  <span className="text-lg text-green-400 font-medium">Active</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
                <Link
                  to="/customization"
                  className="neo-brutalism inline-flex items-center gap-2 bg-primary text-gray-900 text-lg px-8 py-3 rounded-xl"
                >
                  <Settings className="w-5 h-5" />
                  Chatbot Customization
                </Link>
                <Link
                  to="/dashboard"
                  className="neo-brutalism inline-flex items-center gap-2 bg-secondary text-gray-900 text-lg px-8 py-3 rounded-xl"
                >
                  <BarChart2 className="w-5 h-5" />
                  Analyze Dashboard Panel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}