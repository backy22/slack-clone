import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getUserSession } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const sessionuser = await getUserSession(request)
  if (!sessionuser) {
    return redirect('/login');
  }
  return redirect('/channels')
};

export default function IndexRoute() {
  return (
    <div>
      <p>This website is slack clone app</p>
      <Link to="/channels">Channels</Link>
      <br></br>
      <Link to="/login">Login</Link>
    </div>
  );
}
