// app/components/ErrorComponent.tsx
import { Link, useRouteError } from "@remix-run/react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "./layout/navbar"; // Import your Navbar component

interface ErrorComponentProps {
  status?: number;
  title?: string;
  message?: string;
  children?: ReactNode;
  authenticated?: boolean;
}

const statusMessages: Record<number, string> = {
  400: "The request sent to the server was invalid or corrupted",
  401: "Authentication required to access this resource",
  403: "You don't have permission to view this content",
  404: "The page you're looking for doesn't exist",
  500: "Our servers encountered an unexpected condition",
  503: "We're performing maintenance - please check back soon",
};

const defaultTitles: Record<number, string> = {
  400: "Invalid Request",
  401: "Authorization Required",
  403: "Access Restricted",
  404: "Page Not Found",
  500: "Server Error", 
  503: "Service Unavailable",
};

export default function ErrorComponent({
  status,
  title,
  message,
  children,
  authenticated = false,
}: ErrorComponentProps) {
  const error = useRouteError();
  const effectiveStatus = status || (error as any)?.status || 500;
  
  // Dynamic content resolution with fallbacks
  const errorTitle = title || defaultTitles[effectiveStatus] || "Unexpected Error";
  const errorMessage = message || statusMessages[effectiveStatus] || 
    "An unexpected error occurred. Our engineering team has been notified.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/95 to-background/90">
     
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center p-8 pt-24" // Added pt-24 for navbar spacing
      >
        <div className="glass neo-brutalism p-8 rounded-2xl shadow-xl w-full max-w-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {effectiveStatus && (
              <div className="text-8xl font-bold bg-gradient-to-r from-error to-secondary bg-clip-text text-transparent">
                {effectiveStatus}
              </div>
            )}
            
            <div className="space-y-4 flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {errorTitle}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                {errorMessage}
              </p>
              
              {children && (
                <div className="mt-4 p-4 bg-background/50 rounded-lg">
                  {children}
                </div>
              )}
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/"
                  className="btn btn-primary gap-2 hover:scale-[0.98] transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 13h8.5l-4 4-1.414-1.414L10.172 13H5v-2h8.5l-4-4 1.414-1.414L15.5 11H19v2h-6.172l2.586 2.586L14 17.5l-5-5 5-5 1.414 1.414L12.828 11H19v2z" />
                  </svg>
                  Return to Home
                </Link>
                
                <Link
                  to="/support"
                  className="btn btn-outline gap-2 hover:bg-background/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z" />
                  </svg>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}