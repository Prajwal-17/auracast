import { Socket } from "socket.io";
import { v4 as uuid } from "uuid"
import { getSendTransport } from "../../mediasoup/utils";
import { mediasoupState } from "../../mediasoup/mediasoupState";

export function transportProduce(socket: Socket) {
  socket.on("transport-produce", async ({ socketId, kind, rtpParameters }, callback) => {
    try {
      const sendTransport = getSendTransport(socketId);
      const producer = await sendTransport?.produce({ kind, rtpParameters })

      if (!producer) {
        console.error("No producer found");
        return
      }
      const producerId = `producer_${uuid()}`
      mediasoupState.producers.set(producerId, producer)

      socket.broadcast.emit("new-producer", {
        id: producerId,
        type: "producer",
        mediaType: "",
        socketId: socket.id
      });
      callback({ id: producerId });
    } catch (error) {
      console.error("Error producing stream", error)
    }
  })
}