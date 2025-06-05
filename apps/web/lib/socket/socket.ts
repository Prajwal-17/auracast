"use client"

import { io, Socket } from "socket.io-client";

const webSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

if (!webSocketUrl) {
  console.error("Web Scoket Url is missing")
}

export const socketInstance: Socket = io(webSocketUrl, {
  autoConnect: false,
});

export function connectSocket() {
  if (!socketInstance.connected) {
    socketInstance.connect();
  }
}

export function disconnectSocket() {
  if (socketInstance.connected) {
    socketInstance.disconnect();
  }
}