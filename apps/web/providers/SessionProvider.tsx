"use client";

import { Session } from "@auth/core/types";
import { getSession, SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";

export default function SessionProviderWrapper({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}) {
  // const session = useSession();

  return <SessionProvider session={session}>{children}</SessionProvider>;
}

// export async function sessionFnc() {
//   try {
//     const session = await getSession();
//     return session;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// }
