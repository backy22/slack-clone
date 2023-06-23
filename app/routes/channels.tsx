import type { LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { getChannels } from "~/models/channel.server";
import { getUserSession } from "~/utils/session.server";
import { getUser } from "~/models/user.server";

import { Flex, Button, ScrollArea, Navbar } from '@mantine/core'

export const loader = async ({ request }: LoaderArgs) => {
  const sessionuser = await getUserSession(request)
  if (!sessionuser) {
    return redirect('/login');
  }
  return json({ channels: await getChannels(request), user: await getUser(request)});
};

export default function ChannelsRoute() {
  const { channels, user } = useLoaderData<typeof loader>();

  return (
    <Flex>
      <Navbar height={'100vh'} p="xs" width={{ base: 250 }}>
        <Navbar.Section mt="xs" mx="auto">
          <Link to="new" className="button">
            <Button>Add new channel</Button>
          </Link>
        </Navbar.Section>
        <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
          {channels.map(({ slug, name }) => (
            <Link to={slug} key={slug}>
              <Button variant="subtle" w={'100%'} >
                {name}
              </Button>
            </Link>
          ))}
        </Navbar.Section>
        <Navbar.Section>
          {user ? (
            <div className="user-info">
              <span>{`Hi ${user.displayName || user.email}`}</span>
              <Flex>
                <form action="/logout" method="post">
                  <Button type="submit" color="gray" mr="sm">
                    Logout
                  </Button>
                </form>
                <Link to="profile">
                  <Button>Profile</Button>
                </Link>
              </Flex>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </Navbar.Section>
      </Navbar>
      <Outlet />
    </Flex>
  );
}
