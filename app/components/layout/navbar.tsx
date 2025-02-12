import { useState } from "react";
import { Link } from "@remix-run/react";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/docs" className="text-gray-300 hover:text-white transition-colors">Docs</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link
              to="/register"
              className="neo-brutalism bg-primary hover:bg-primary-hover text-slate-950 px-4 py-2 rounded-xl"
            >
              Get Started
            </Link>
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