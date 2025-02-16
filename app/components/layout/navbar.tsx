import { Link } from "@remix-run/react";

export const Navbar = ({ authenticated }: { authenticated: boolean }) => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          ChatBot Builder
        </Link>
        <div>
          {authenticated ? (
            <Link to="/dashboard" className="text-gray-300 hover:text-white mx-2">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white mx-2">
                Login
              </Link>
              <Link to="/register" className="text-gray-300 hover:text-white mx-2">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
