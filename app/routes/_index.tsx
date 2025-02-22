// app/routes/index.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Navbar } from "~/components/layout/navbar";
import { Bot, BarChart2, Settings, ArrowRight } from "lucide-react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { isAuthenticated } = await getKindeSession(request);
  if (await isAuthenticated()) {
    return redirect("/profile");
  }
  return json({});
};

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage for user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.id && user?.email) {
        // Auto-redirect to /profile if user data exists
        navigate("/profile");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 relative">
      <Navbar />
      {/* 3D Elements */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden">
        <div className="parallax-layer absolute inset-0">
          <div className="cube-1"></div>
          <div className="cube-2"></div>
          <div className="cube-3"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center relative z-10">
            <div className="glass-card max-w-3xl mx-auto p-8 rounded-2xl mb-12">
              <h1 className="text-4xl sm:text-6xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-primary bg-[200%_auto] animate-gradient-rotate bg-clip-text text-transparent">
                Build Intelligent Chatbots
                <br />
                Without Code
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Create, customize, and deploy AI-powered chatbots in minutes.
                <br />
                No coding required.
              </p>
              <Link
                to="/register"
                className="neo-brutalism inline-flex items-center gap-2 bg-primary text-gray-900 text-lg px-8 py-3 rounded-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Everything you need to build amazing chatbots
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-transform duration-300">
              <Bot className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-white">Visual Builder</h3>
              <p className="text-gray-400">
                Drag and drop interface to build conversational flows easily
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-transform duration-300">
              <BarChart2 className="w-12 h-12 text-secondary mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-white">Analytics</h3>
              <p className="text-gray-400">
                Track performance and optimize your chatbots with detailed insights
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-transform duration-300">
              <Settings className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-white">Customization</h3>
              <p className="text-gray-400">
                Personalize every aspect of your chatbot to match your brand
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}