'use client'

import { connectSocket, disconnectSocket, socketInstance } from "@/lib/socket/socket";
import { useCallStore } from "@/store/useCallStore";
import { RefObject, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

type UseSocketType = {
  socketId: string;
  socketRef: RefObject<Socket | null>;
}

export default function useSocket(): UseSocketType {
  const socketRef = useRef<Socket | null>(null);
  const socketId = useCallStore((state) => state.socketId);
  const setSocketId = useCallStore((state) => state.setSocketId);

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
      console.error("Error occured in socket connection ", err);
    });

    return () => {
      disconnectSocket();
    };
  }, [setSocketId]);

  return {
    socketId,
    socketRef
  }
} 
