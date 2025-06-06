import { Socket } from "socket.io";
import { createRouter } from "../../mediasoup/router";

export function handleRoomJoin(socket: Socket) {
  socket.on("join-room", async (roomId) => {
    try {
      await createRouter(roomId)
      socket.join(roomId)
    } catch (error) {
      console.error("Error joining room", error)
    }
  })
}