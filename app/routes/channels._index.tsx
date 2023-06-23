import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";

import { Notification } from '@mantine/core';

export default function ChannelsIndexRoute() {
  return (
    <div>
      <p>Welcome to slack clone</p>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">
        <p>There are no channels to display.</p>
        <Link to="new">Add your own</Link>
      </div>
    );
  }
  return (
    <Notification color="red">
      I did a whoopsies.
    </Notification>
  );
}
