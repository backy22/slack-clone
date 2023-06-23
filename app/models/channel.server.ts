import { redirect } from "@remix-run/node";

import { db } from "~/utils/db.server";
import { getUserSession } from "~/utils/session.server";

export async function getChannels(request: Request) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const querySnapshot = await db.collection("channels").get();

  const data: any[] = [];
  querySnapshot.forEach((doc) => {
    data.push({ ...doc.data(), id: doc.id });
  });

  return data;
}

export async function getChannel({ request, slug }: { request: Request, slug: string }) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const docSnapshot = await db.collection("channels").doc(slug).get();

  if (!docSnapshot.exists) {
    throw Error("No such document exists");
  } else {
    const Channel = docSnapshot.data();
    return Channel;
  }
}

export async function createChannel({ request, fields }: {request: Request, fields: {name: string}}) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const { name } = fields;
  const slug = name.toLowerCase().replace(/[^\w-]+/g, '-');

  const docRef = db.collection("channels").doc(slug); // slug should be uniq
  await docRef.set({ name, slug, owner: sessionUser.uid });

  return getChannel({ request, slug });
}

export async function deleteChannel({ request, slug }: {request: Request, slug: string}) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const channel = await getChannel({ request, slug });
  const docRef = db.collection("channels").doc(slug);
  await docRef.delete();
  return channel;
}