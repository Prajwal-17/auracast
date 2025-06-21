"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignin() {
    try {
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
      });

      console.log(data, error);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleGoogleSignin() {
    try {
      const data = await authClient.signIn.social({
        provider: "google",
      });
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleSignin}>Sign Up</Button>
          <Button onClick={handleGoogleSignin}>Sign in with google</Button>
        </div>
      </div>
    </>
  );
}
