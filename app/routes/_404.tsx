// app/routes/_404.tsx
import { Link, useRouteError } from "@remix-run/react";
import type { ErrorResponse } from "@remix-run/node";

const NotFound = () => {
  const error = useRouteError() as ErrorResponse;
  console.error(error); // Log the error for debugging. Important!

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            404
          </h1>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-full">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl mx-auto animate-float" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
          <p className="text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Conditionally display error details in development */}
          {process.env.NODE_ENV === "development" && (
            <pre className="bg-gray-700 text-white p-4 rounded mt-4"> {/* Added some styling */}
              {error?.data?.message || "No error message available"}
            </pre>
          )}

          <Link
            to="/"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

