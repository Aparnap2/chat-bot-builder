// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo-client";
import "./tailwind.css";
import NotFound from "../app/routes/_404";
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
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
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
// Add security headers to all responses
// export function headers() {
//   return {
//     "Content-Security-Policy": `default-src 'self'`,
//     "X-Frame-Options": "DENY",
//     "X-Content-Type-Options": "nosniff",
//     "Referrer-Policy": "strict-origin-when-cross-origin",
//     "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
//   };
// }
export function ErrorBoundary() {
  const error = useRouteError();

  // If it's a thrown Response (e.g. a 404 or 401), render an appropriate UI.
  if (isRouteErrorResponse(error)) {
    return (
      <NotFound />
    );
  }

  // Otherwise, render a generic error UI.
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  return (
    <NotFound />
  );
}

export default function App() {
  return (
    <Layout>
     
        <Outlet />
     
    </Layout>
  );
}
