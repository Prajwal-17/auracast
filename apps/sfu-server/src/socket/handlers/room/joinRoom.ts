import { Socket } from "socket.io";

export default function joinRoom(socket: Socket) {
  socket.on("join-room", async (roomId, callback) => {
    try {
      await socket.join(roomId)
      socket.data.roomId = roomId;
      callback()
    } catch (error) {
      console.error("Error joining room", error)
    }
  });
}