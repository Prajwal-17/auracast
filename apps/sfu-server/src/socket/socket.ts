import { Server } from "socket.io";

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    io.emit("message", "Hello world");

    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      socket.emit("message", "Received: " + msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
