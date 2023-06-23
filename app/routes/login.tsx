import type { ActionArgs } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";

import { badRequest } from "~/utils/request.server";
import { login, signUp } from "~/utils/db.server"
import { createUserSession } from "~/utils/session.server";
import { createUser } from "~/models/user.server"

import { Container, Box, Title, Group, Radio, TextInput, Button } from '@mantine/core';

function validateEmail(email: string) {
  if (email.length < 3) {
    return "emails must be at least 3 characters long";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Passwords must be at least 6 characters long";
  }
}

function validateUrl(url: string) {
  const urls = ["/channels", "/"];
  if (urls.includes(url)) {
    return url;
  }
  return "/channels";
}

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const password = form.get("password");
  const email = form.get("email");
  const displayName = form.get("displayName");
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/channels"
  );
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof email !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fields = { loginType, password, email, displayName };
  const fieldErrors = {
    password: validatePassword(password),
    email: validateEmail(email),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginType) {
    case "login": {
      const { user } = await login(email, password)
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "Email/Password combination is incorrect",
        });
      }
      const token = await user.getIdToken();
      return createUserSession(token, redirectTo)
    }
    case "register": {
      const { user } = await signUp(email, password)
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: "Something went wrong trying to create a new user.",
        });
      }
      const token = await user.getIdToken();
      const userFields = {uid: user.uid, email, displayName}
      await createUser({ request, fields: userFields });
      return createUserSession(token, redirectTo)
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Login type invalid",
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  return (
    <Container>
      <Box
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          padding: theme.spacing.xl,
          borderRadius: theme.radius.md,
        })}
      >
        <Title order={1} align="center">Login</Title>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <Radio.Group
              name="favoriteFramework"
              withAsterisk
            >
              <Group mt="xs">
                <Radio value="login" label="Login" name="loginType"/>
                <Radio value="register" label="Register" name="loginType"/>
              </Group>
            </Radio.Group>
          </fieldset>
          <div>
            <TextInput
              placeholder="email"
              label="email"
              withAsterisk
              name="email"
              error={
                actionData?.fieldErrors?.email
                  ? "email error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.email ? (
              <p
                className="form-validation-error"
                role="alert"
                id="email-error"
              >
                {actionData.fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div>
            <TextInput
              placeholder="Password"
              label="Password"
              withAsterisk
              name="password"
              type="password"
              error={
                actionData?.fieldErrors?.password
                  ? "Password error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <Button type="submit">
            Submit
          </Button>
        </form>
      </Box>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/channels">Channels</Link>
          </li>
        </ul>
      </div>
    </Container>
  );
}
