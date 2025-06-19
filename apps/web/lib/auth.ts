import NextAuth, { NextAuthConfig, NextAuthResult } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@repo/db/prisma"

export const config: NextAuthConfig = {
  secret: process.env.AUTH_SECRET as string,
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "email",
          placeholder: "Enter your email"
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: async (credentials) => {
        if (!credentials.email || !credentials.password) {
          throw new Error("All fields are required")
        };

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("User does not exist")
        };

        const isPassword = await bcrypt.compare(credentials.password as string, user.password)

        if (!isPassword) {
          throw new Error("Password is incorrect")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider !== "credentials") return true;

      return true;
    },
    jwt: ({ token, user, account }) => {
      if (account) {
        token.accessToken = account.access_token;
        // token.refreshToken = account.access_token;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      console.log("token", token)
      return token
    },
    session: ({ token, session }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string
        }
        session.accessToken = token.accessToken as string
        // session.refreshToken = token.refreshToken as string
      }
      return session
    }
  }
}

export const authOptions = NextAuth(config)

export const handlers: NextAuthResult["handlers"] = authOptions.handlers;
export const auth: NextAuthResult["auth"] = authOptions.auth;
export const signIn: NextAuthResult["signIn"] = authOptions.signIn;
export const signOut: NextAuthResult["signOut"] = authOptions.signOut;

// NextAuth export type fix - https://github.com/nextauthjs/next-auth/discussions/9950#discussioncomment-12937660