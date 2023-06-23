import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { createChannel } from "~/models/channel.server";
import { Link, useActionData, isRouteErrorResponse, useRouteError } from "@remix-run/react";

import { badRequest } from "~/utils/request.server";
import { getUserSession } from "~/utils/session.server";

import { TextInput, Button, Group } from '@mantine/core';
import { Notification } from '@mantine/core';

export const loader = async ({ request }: LoaderArgs) => {
  const sessionuser = await getUserSession(request)
  if (!sessionuser) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({});
};

function validateChannelName(name: string) {
  if (name.length < 3) {
    return "That channel's name is too short";
  }
}

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const name = form.get("name");

  if (
    typeof name !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fieldErrors = {
    name: validateChannelName(name),
  };

  const fields = { name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }
  const channel = await createChannel({ request, fields });

  return redirect(`/channels/${channel?.slug}`);
};

export default function NewChannelRoute() {
  const actionData = useActionData<typeof action>();
  return (
    <div>
      <p>Add a channel</p>
      <form method="post">
        <TextInput
          defaultValue={actionData?.fields?.name}
          placeholder="Name"
          label="Name"
          withAsterisk
          name="name"
          error={
            actionData?.fieldErrors?.name
              ? "Name error"
              : undefined
          }
        />
        {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
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
            Add
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
