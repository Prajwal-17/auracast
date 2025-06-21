"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  async function handleSignOut() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            console.log("Logged Out");
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="bg-green-500">Hello World!</div>
      <Button variant="default">Hello</Button>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </>
  );
}
