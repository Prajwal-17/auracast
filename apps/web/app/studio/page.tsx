"use client";

import { Button } from "@/components/ui/button";
import { connectSocket, disconnectSocket, socketInstance } from "../socket";
import { useEffect, useRef, useState } from "react";
import short from "short-uuid";
import { Socket } from "socket.io-client";

export default function Studio() {
  const socketRef = useRef<Socket | null>(null);

  const [socketId, setSocketId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  // add auth check in socket
  useEffect(() => {
    socketRef.current = socketInstance;
    connectSocket();

    const socket = socketRef.current;

    socket.on("connect", () => {
      if (socket.id) {
        setSocketId(socket.id);
      } else {
        console.warn("Socket Id is not defined");
      }
    });

    socket.on("error", (err) => {
      console.error(err);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  async function startCall() {
    try {
      const socket = socketRef.current;

      if (!socket) {
        console.warn("Socket not initialized yet");
        return;
      }

      setRoomId(short().generate());
      socket.emit("join-room", roomId);
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
