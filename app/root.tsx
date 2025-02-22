// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import "./tailwind.css";
import NotFound from "./routes/_404";
import { StrictMode } from "react";
import { Navbar } from "~/components/layout/navbar";
import ErrorComponent from "./components/error";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) return <NotFound />;
  let errorMessage = "Unknown error";
  if (error instanceof Error) errorMessage = error.message;
  return <ErrorComponent message={errorMessage} />;
}

export default function App() {
  return (
    <StrictMode>
      <Layout>
        <Outlet />
      </Layout>
    </StrictMode>
  );
}