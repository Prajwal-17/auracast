import { Socket } from "socket.io";
import { getRoom } from "../../../mediasoup/utils";

export default function getAllProducers (socket:Socket){
    socket.on("getAllProducers", async ({ roomId, socketId }, callback) => {
      const room = getRoom(roomId);
      const peer = room?.peers.get(socketId)
      const producerIds = room?.producers.keys();

      if (!producerIds) {
        return
      }
      const filteredProducers = Array.from(producerIds).filter(p => !peer?.producers.has(p))
      callback({ allProducers: filteredProducers })
    })
}