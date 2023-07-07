import { redirect } from "@remix-run/node";

import { db } from "~/utils/db.server";
import { getUserSession } from "~/utils/session.server";

export async function getMessages({ request, channel }: {request: Request, channel: string}) {;
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const querySnapshot = await db.collection("messages").where("channel", "==", channel).orderBy("createdAt").limit(25).get()

  const data: any[] = [];
  querySnapshot.forEach((doc) => {
    data.push({ ...doc.data(), id: doc.id });
  });

  return data;
}

export async function createMessage({ request, fields }: { request: Request, fields: {channel: string, userId: string, text: string} }) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const { channel, userId, text } = fields;

  const docRef = db.collection("messages").doc();
  await docRef.set({ channel, userId, text, createdAt: new Date() });

  return true;
}