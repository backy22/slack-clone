import { redirect } from "@remix-run/node";

import { db } from "~/utils/db.server";
import { getUserSession } from "~/utils/session.server";

export async function createUser({ request, fields }: {request: Request, fields: {uid: string, email: string, displayName?: string}}) {
  const { uid, email, displayName } = fields;

  const docRef = db.collection("users").doc(uid);
  await docRef.set({ email, displayName });

  return getUser({ request });
}

export async function updateUser({ request, fields }: {request: Request, fields: {displayName?: string}}) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const { displayName } = fields;

  const docRef = db.collection("users").doc(sessionUser.uid);
  await docRef.set({ displayName });

  return getUser({ request });
}

export async function getUsers(request: Request) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const querySnapshot = await db.collection("users").get();

  const data: any[] = [];
  querySnapshot.forEach((doc) => {
    data.push({ ...doc.data(), id: doc.id });
  });

  return data;
}

export async function getUser(request: Request) {
  const sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return redirect("/login");
  }

  const docSnapshot = await db.collection("users").doc(sessionUser.uid).get();

  if (!docSnapshot.exists) {
    throw Error("No such document exists");
  } else {
    const User = docSnapshot.data();
    return User;
  }
}