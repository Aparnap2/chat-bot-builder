// app/components/layout/navbar.tsx
import { useState } from "react";
import { Link } from "@remix-run/react";
import { Menu, X, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState("");

  return (
    <nav className="navbar bg-gradient-to-b from-background/95 to-background/90 shadow-lg glass neo-brutalism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-[200%_auto] animate-gradient-rotate bg-clip-text text-transparent">
                ChatBuilder
              </span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link
              to="/docs"
              className="neo-brutalism inline-flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-sm font-medium"
              onMouseEnter={() => setHoveredPath("/docs")}
              onMouseLeave={() => setHoveredPath("")}
            >
              Docs
              {hoveredPath === "/docs" && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl glass"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
            <Link
              to="/pricing"
              className="neo-brutalism inline-flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-sm font-medium"
              onMouseEnter={() => setHoveredPath("/pricing")}
              onMouseLeave={() => setHoveredPath("")}
            >
              Pricing
              {hoveredPath === "/pricing" && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl glass"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
            <Link
              to="/dashboard"
              className="neo-brutalism inline-flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-sm font-medium"
              onMouseEnter={() => setHoveredPath("/dashboard")}
              onMouseLeave={() => setHoveredPath("")}
            >
              Dashboard
              {hoveredPath === "/dashboard" && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl glass"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
            <Link
              to="/logout"
              className="neo-brutalism inline-flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-sm font-medium"
              onMouseEnter={() => setHoveredPath("/logout")}
              onMouseOut={() => setHoveredPath("")}
            >
              <LogOut className="w-5 h-5" />
              Logout
              {hoveredPath === "/logout" && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl glass"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="neo-brutalism inline-flex items-center gap-2 btn btn-ghost btn-square"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-gradient-to-b from-background/95 to-background/90 glass neo-brutalism">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/docs" className="neo-brutalism inline-flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-300 hover:text-white">
              Docs
            </Link>
            <Link to="/pricing" className="neo-brutalism inline-flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-300 hover:text-white">
              Pricing
            </Link>
            <Link to="/dashboard" className="neo-brutalism inline-flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-300 hover:text-white">
              Dashboard
            </Link>
            <Link to="/logout" className="neo-brutalism inline-flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-300 hover:text-white">
              <LogOut className="w-5 h-5" />
              Logout
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};