import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { updateUser, getMyself } from "~/models/user.server";
import { useLoaderData, Link, useActionData, isRouteErrorResponse, useRouteError } from "@remix-run/react";

import { badRequest } from "~/utils/request.server";
import { getUserSession } from "~/utils/session.server";

import { TextInput, Button, Group } from '@mantine/core';
import { Notification } from '@mantine/core';

export const loader = async ({ request }: LoaderArgs) => {
  const sessionuser = await getUserSession(request)
  if (!sessionuser) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({user: await getMyself(request)});
};

function validateDisplayName(displayName: string) {
  if (displayName.length < 3) {
    return "That display name is too short";
  }
}

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const displayName = form.get("displayName");

  if (
    typeof displayName !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fieldErrors = {
    displayName: validateDisplayName(displayName),
  };

  const fields = { displayName };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  await updateUser({ request, fields });
  return redirect("/channels");
};

export default function NewChannelRoute() {
  const actionData = useActionData<typeof action>();
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Update profile</p>
      <form method="post">
        <TextInput
          defaultValue={user.displayName}
          placeholder="Display Name"
          label="Display Name"
          withAsterisk
          name="displayName"
          error={
            actionData?.fieldErrors?.displayName
              ? "Display name error"
              : undefined
          }
        />
        {actionData?.fieldErrors?.displayName ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.displayName}
            </p>
          ) : null}
        <Group>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <Button type="submit">
            Save
          </Button>
        </Group>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <Notification color="red">
      Something unexpected went wrong. Sorry about that.
    </Notification>
  );
}

