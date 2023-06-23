import type { MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import type { PropsWithChildren } from "react";

import { MantineProvider, createEmotionCache } from '@mantine/core';
import { StylesPlaceholder } from '@mantine/remix';
// import { theme } from './theme';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Slack Clone',
  viewport: 'width=device-width,initial-scale=1',
});

createEmotionCache({ key: 'mantine' });

function Document({
  children,
  title = "Slack clone with Remix",
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <MantineProvider theme={{colorScheme: 'dark'}} withGlobalStyles withNormalizeCSS>
      <html lang="en">
        <head>
          <StylesPlaceholder />
          <Meta />
        </head>
        <body>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </MantineProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document
        title={`${error.status} ${error.statusText}`}
      >
        <div className="error-container">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error";
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}