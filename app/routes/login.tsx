import { useState } from "react";
import { Link } from "@remix-run/react";
import { toast } from "react-hot-toast";
import { ArrowRight } from "lucide-react";

function login({ authUrlParams }: { authUrlParams: { connection_id: string } }) {
  // Construct the URL with the given connection_id
  const url = `/kinde-auth/login?connection_id=${authUrlParams.connection_id}`;
  // Optionally show a toast message
  toast("Redirecting to Google sign in...");
  // Redirect to the Kinde authentication endpoint
  window.location.href = url;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Other form fields may be used for non-Google authentication if needed.
  // For Google auth, we simply use a button with onClick.

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome back
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          {/* Instead of a full form, we now simply offer a button to trigger Google auth */}
          <button
            onClick={() =>
              login({
                authUrlParams: {
                  connection_id: "conn_0190c847b77996ef9532a4f639f1bd5a",
                },
              })
            }
            className="neo-brutalism w-full flex justify-center items-center gap-2 py-2 px-4 bg-primary text-slate-900 text-sm font-medium rounded-xl"
          >
            Sign in with Google <ArrowRight className="w-4 h-4" />
          </button>
          <div className="mt-6">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
