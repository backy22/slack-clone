import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useParams, isRouteErrorResponse, useRouteError } from "@remix-run/react";

import { getChannel, deleteChannel } from "~/models/channel.server";
import { getMessages, createMessage } from "~/models/message.server"
import { getUser } from "~/models/user.server"
import { requireUserId } from "~/utils/session.server";

import { Flex, Title, Box, Container, Group, ActionIcon, Notification, ScrollArea, Affix, rem, TextInput, Button, Text, Divider } from '@mantine/core';
import { IconTrash, IconBrandTelegram } from '@tabler/icons-react';

export const loader = async ({ request, params }: LoaderArgs) => {
  const channel = await getChannel({ request, slug: params.slug })
  if (!channel) {
    throw new Response("Not found.", {
      status: 404,
    });
  }
  const userId = await requireUserId(request)
  const isChannelOwner = channel.owner == userId
  const user = await getUser(request)
  const messages = await getMessages({ request, channel: params.slug })
  return json({ channel, isChannelOwner, messages, user })
};

export const action = async ({
  params,
  request,
}: ActionArgs) => {
  const form = await request.formData();
  const userId = await requireUserId(request);
  const channel = await getChannel({ request, slug: params.slug })
  if (!channel) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  switch(form.get("intent")) {
    case "delete":
      if (channel.owner !== userId) {
        throw new Response(
          "Pssh, nice try. That's not your channel",
          { status: 403 }
        );
      }
      await deleteChannel({request, slug: channel.slug})
      return redirect("/channels");
    case "post":
      const text = form.get("text");
      const fields = { text, userId, channel: channel.slug };
      await createMessage({ request, fields });
      return redirect(`/channels/${channel.slug}`)
    default:
      throw new Response(
        `The intent ${form.get("intent")} is not supported`,
        { status: 400 }
      );
  }
};

export default function ChannelRoute() {
  const actionData = useActionData<typeof action>();
  const { channel, isChannelOwner, messages, user } = useLoaderData<typeof loader>();

  return (
    <Box px="0" sx={{width: 'calc(100% - 300px)'}}>
       <Title order={3} p={"xs"}>{channel.name}</Title>
      {isChannelOwner && (
        <form method="post">
          <ActionIcon 
            name="intent"
            type="submit"
            value="delete"
            variant="transparent"
          >
            <IconTrash size="1rem" />
          </ActionIcon>
        </form>
      )}
      <Divider size="sm" />
      <ScrollArea p={"xs"}>
        {messages && messages.map(({ id, text, createdAt }) => (
          <Flex key={id} direction="column" mb="xs">
            <Text fz="sm" c="dimmed">
              <Text span pr="sm">{user.displayName}</Text>
              {new Date(createdAt._seconds * 1000).toLocaleDateString("en-US", {weekday: "short", month: "long", day: "numeric",})}, {new Date(createdAt._seconds * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</Text>
            <Text sx={{ 'overflow-wrap': 'break-word' }}>{text}</Text>
          </Flex>
        ))}
      </ScrollArea>
      <Affix position={{ bottom: rem(20), left: 258 }} sx={{width: 'calc(100% - 300px)'}}>
        <form method="post">
          <Flex align="center">
            <TextInput
              defaultValue={actionData?.fields?.message}
              placeholder="Text"
              name="text"
              w={'100%'}
              rightSection={
                <ActionIcon
                color="blue"
                name="intent"
                type="submit"
                value="post"
                variant="filled"
              >
                <IconBrandTelegram size="1rem" />
              </ActionIcon>
              }
            />
          </Flex>
        </form>
      </Affix>
    </Box>
  );
}

export function ErrorBoundary() {
  const { slug } = useParams();
  const error = useRouteError();
  console.log(error)

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          Sorry, but "{slug}" is not your joke.
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="error-container">
          Huh? What the heck is "{slug}"?
        </div>
      );
    }
  }

  return (
    <Notification color="red">
      There was an error loading channel by the slug "{slug}". Sorry.
    </Notification>
  );
}