import { PassThrough } from "node:stream";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

// Use default import and destructure the named exports from '@apollo/client'
import pkg from '@apollo/client';
const { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } = pkg;

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function createApolloClient(request: Request) {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: createHttpLink({
      uri: "https://flyby-gateway.herokuapp.com/", // Replace with your GraphQL endpoint
      headers: Object.fromEntries(request.headers.entries()),
      credentials: request.credentials ?? "include",
    }),
  });
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const client = createApolloClient(request);

  const app = (
    <ApolloProvider client={client}>
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
    </ApolloProvider>
  );

  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(app, {
      onAllReady() {
        shellRendered = true;
        const body = new PassThrough();
        const stream = createReadableStreamFromReadable(body);
        responseHeaders.set("Content-Type", "text/html");
        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode,
          })
        );
        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        responseStatusCode = 500;
        if (shellRendered) {
          console.error(error);
        }
      },
    });
    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const client = createApolloClient(request);

  const app = (
    <ApolloProvider client={client}>
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
    </ApolloProvider>
  );

  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(app, {
      onShellReady() {
        shellRendered = true;
        const body = new PassThrough();
        const stream = createReadableStreamFromReadable(body);
        responseHeaders.set("Content-Type", "text/html");
        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode,
          })
        );
        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        responseStatusCode = 500;
        if (shellRendered) {
          console.error(error);
        }
      },
    });
    setTimeout(abort, ABORT_DELAY);
  });
}