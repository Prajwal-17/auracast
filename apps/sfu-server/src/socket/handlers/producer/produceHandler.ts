import { Socket } from "socket.io";
import { getRoom, getSendTransport } from "../../../mediasoup/utils";
import { io } from "../../..";

export default function produceHandler(socket: Socket) {
  socket.on("transport-produce", async ({ roomId, sendTransportId, kind, rtpParameters }, callback) => {
    try {
      const room = getRoom(roomId);
      const router = room?.router;
      const sendTransport = getSendTransport(roomId, sendTransportId);
      const producer = await sendTransport?.produce({ kind, rtpParameters, appData: { routerId: router?.id, socketId: socket.id } })

      if (!producer) {
        console.error("No producer found");
        return
      }

      const producerId = producer.id
      room?.producers.set(producerId, producer)
      const peer = room?.peers.get(socket.id);
      peer?.producers.add(producerId);

      io.to(roomId).emit("new-producer", {
        producerId: producerId,
        producerSocketId: socket.id
      })
      callback(producerId);
    } catch (error) {
      console.error("Error producing stream", error)
    }
  })
}