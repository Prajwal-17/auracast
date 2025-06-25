import { Socket } from "socket.io";
import { createRouter } from "../../../mediasoup/router";

export default function createRoom(socket: Socket) {
  socket.on("create-room", async (roomId, callback) => {
    try {
      await socket.join(roomId)
      await createRouter(roomId)
      socket.data.roomId = roomId;
      callback()
    } catch (error) {
      console.error("Error joining room", error)
    }
  });
}