import { Socket } from "socket.io";
import { getRoom } from "../../../mediasoup/utils";

export default function getAllProducers(socket: Socket) {
  socket.on("getAllProducers", async ({ roomId, socketId }, callback) => {
    const room = getRoom(roomId);
    const peer = room?.peers.get(socketId)
    const producerIds = room?.producers.keys();

    if (!producerIds) {
      return
    }
    const filteredProducerIds = Array.from(producerIds).filter(p => !peer?.producers.has(p))

    let filteredProducers: { producerId: string, producerSocketId: string }[] = []

    Array.from(filteredProducerIds).forEach((producerId) => {
      const producer = room?.producers.get(producerId);
      filteredProducers.push({
        producerId: producerId,
        producerSocketId: producer?.appData.socketId as string,
      })
    })

    callback({ allProducers: filteredProducers })
  })
}