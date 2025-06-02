import { Server } from "socket.io";

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {

    socket.on("join-room", (msg) => {
      socket.join(msg)
    })
    console.log(socket.rooms)

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
}
