import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string,
    name: string,
    email: string,
  }

  interface Session {
    user: User,
    accessToken?: string,
    refreshToken?: string
  }

  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    name: string;
    email: string;
  }
}