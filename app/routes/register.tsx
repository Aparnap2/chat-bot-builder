import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { toast } from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { isAuthenticated } = await getKindeSession(request);
  if (await isAuthenticated()) throw redirect("/profile");
  return json({});
};

export default function Register() {
  const handleClick = () => {
    toast("Redirecting to Google sign up...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="hidden lg:block absolute inset-0 overflow-hidden">
        <div className="parallax-layer absolute inset-0">
          <div className="cube-1"></div>
          <div className="cube-2"></div>
          <div className="cube-3"></div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Join us!
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          <Link
            to="/kinde-auth/register?connection_id=conn_0190c847b77996ef9532a4f639f1bd5a"
            onClick={handleClick}
            className="neo-brutalism w-full flex justify-center items-center gap-2 py-2 px-4 bg-primary text-slate-900 text-sm font-medium rounded-xl"
          >
            Sign up with Google <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="mt-6">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}