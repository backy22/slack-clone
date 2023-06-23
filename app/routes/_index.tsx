import { Link } from "@remix-run/react";

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
