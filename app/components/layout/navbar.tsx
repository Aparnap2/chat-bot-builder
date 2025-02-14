import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { Menu, X } from "lucide-react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const { isAuthenticated } = await getKindeSession(new Request(window.location.href));
      const auth = await isAuthenticated();
      setAuthenticated(auth);
    })();
  }, []);

  return (
    <nav className="glass-card backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ChatBuilder
              </span>
            </Link>
  {authenticated ? (
    <>
      <Link to="/profile" className="text-gray-300 hover:text-white">
        Profile
      </Link>
      <form action="/kinde-auth/logout" method="post">
        <button type="submit" className="text-gray-300 hover:text-white">
          Logout
        </button>
      </form>
    </>
  ) : (
    <>
    </>
  )}
      </div>

{/* Mobile menu button */}
<div className="flex items-center sm:hidden">
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
  >
    {isOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
</div>
</div>
</div>

{/* Mobile Navigation */}
{isOpen && (
<div className="sm:hidden glass-card">
<div className="pt-2 pb-3 space-y-1">
  <Link
    to="/docs"
    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
  >
    Docs
  </Link>
  <Link
    to="/pricing"
    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
  >
    Pricing
  </Link>
  <Link
    to="/login"
    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
  >
    Login
  </Link>
  <Link
    to="/register"
    className="block px-3 py-2 text-base font-medium bg-primary text-white hover:bg-primary-hover"
  >
    Get Started
  </Link>
</div>
</div>
)}
</nav>
);
};
          