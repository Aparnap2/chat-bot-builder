import { Link, useRouteError } from "@remix-run/react";
import type { ErrorResponse } from "@remix-run/node";
import { useState, useEffect } from "react";

const NotFound = () => {
  const error = useRouteError() as ErrorResponse;
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    // Automatically show the about section after 3 seconds
    const timer = setTimeout(() => {
      setShowAbout(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getCustomMessage = () => {
    // Mock function to get custom admin message
    return  <p className=" font-serif text-orange-200 mb-4">
    This is a portfolio project hosted on free services, which may occasionally experience crashes.
  </p>;
  };

  const customMessage = getCustomMessage();

  const errorType = error.status || "unknown";
  let errorMessage = "";
  switch (errorType) {
    case 404:
      errorMessage = "The page you're looking for doesn't exist or has been moved.";
      break;
    case 500:
      errorMessage = "An unexpected error occurred. Please try again later.";
      break;
    default:
      errorMessage = "An unknown error occurred. Please try again later.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Number with Floating Effect */}
        <div className="relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-full">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl mx-auto animate-float" />
          </div>
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 error-number">
            {errorType}
          </h1>
        </div>

        {/* Error Message and Admin Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{errorMessage}</h2>
          <p className="text-gray-400">{customMessage}</p>

          {import.meta.env.DEV && (
            <pre className="bg-gray-700 text-white p-4 rounded mt-4">
              {error.data || "No error message available"}
            </pre>
          )}

          <Link
            to="/"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            Return Home
          </Link>
        </div>

        {/* Error Insights Section */}
        <div className="mt-8 bg-gray-700/50 backdrop-blur-sm text-white p-6 rounded-lg border border-gray-600 animate-slide-in">
          <h3 className="text-xl font-bold mb-4">Error Insights</h3>
          <p className="text-gray-300 mb-4">Here's what might have happened:</p>
          <ul className="list-disc pl-5 space-y-2 text-left">
            <li>The URL might be incorrect.</li>
            <li>The page might have been removed or renamed.</li>
            <li>There might be a temporary issue with our server.</li>
          </ul>
        </div>

        {/* What You Can Do Section */}
        <div className="mt-8 bg-gray-700/50 backdrop-blur-sm text-white p-6 rounded-lg border border-gray-600 animate-slide-in">
          <h3 className="text-xl font-bold mb-4">What You Can Do</h3>
          <ul className="list-disc pl-5 space-y-2 text-left">
            <li>Check the URL for any typos.</li>
            <li>Try refreshing the page.</li>
            <li>Contact us if the problem persists.</li>
          </ul>
        </div>

       
          <div className="mt-8 bg-gray-700/50 backdrop-blur-sm text-white p-6 rounded-lg border border-gray-600 animate-slide-in">
            <h3 className="text-xl font-bold mb-4">About This Project</h3>
           
            <h4 className="text-md font-bold mb-2">Tech Stack</h4>
            <ul className="list-disc pl-5 space-y-2 text-left">
              <li>Chat Bot Builder</li>
              <li>Remix</li>
              <li>Upstash Redis</li>
              <li>Gemini </li>
              <li>Kinde Auth</li>
              <li>Astra db</li>
            </ul>
          </div>
        
      </div>
    </div>
  );
};

export default NotFound;