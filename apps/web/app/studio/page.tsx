"use client";

import { Button } from "@/components/ui/button";
import { socket } from "../socket";

export default function Studio() {
  async function startCall() {
    try {
      socket.on("connect", () => {
        socket.on("error", (err) => {
          console.error(err);
        });

        socket.on("message", (msg) => {
          console.log(msg);
          socket.emit("message", "helloo from client");
        });
      });
      console.log("start call");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div>
        <div>Welcome to studio</div>
        <Button onClick={startCall}>Start Call</Button>
      </div>
    </>
  );
}
