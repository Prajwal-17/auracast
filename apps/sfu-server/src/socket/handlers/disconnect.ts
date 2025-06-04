import { Socket } from "socket.io";

export function handleDisconnect(socket: Socket) {
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
}