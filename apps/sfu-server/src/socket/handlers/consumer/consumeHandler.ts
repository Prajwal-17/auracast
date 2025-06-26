import { Socket } from "socket.io";
import { getRecvTransport, getRoom } from "../../../mediasoup/utils";

export default function consumeHandler(socket: Socket) {
  socket.on("transport-consume", async ({ roomId, recvTransportId, producerId, rtpCapabilities }, callback) => {
    try {
      const room = getRoom(roomId);
      const router = room?.router;
      const recvTransport = getRecvTransport(roomId, recvTransportId)
      const peer = room?.peers.get(socket.id);

      if (!router?.canConsume({ producerId, rtpCapabilities })) {
        console.log("cannot consume")
        return;
      }

      const consumer = await recvTransport?.consume({
        producerId,
        rtpCapabilities,
        paused: true
      })

      if (!consumer) {
        console.error("Consumer cannot be created")
        return;
      }

      const consumerId = consumer.id;
      room?.consumers.set(consumerId, consumer)
      room?.peers.get(socket.id)?.consumers.add(consumerId)
      const peerConsumersSet = room?.peerConsumers.get(socket.id) ?? new Set();
      if (!room?.peerConsumers.has(socket.id)) {
        room?.peerConsumers.set(socket.id, peerConsumersSet)
      }
      peerConsumersSet.add(producerId)
      console.log("socketid", socket.id)
      // console.log("prod socketid", producerSocketId)

      const socketId = socket.id;
      callback({
        id: consumerId,
        producerId: producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        // producerSocketId: producerSocketId,
        socketId: socketId
      });
    } catch (error) {
      console.error("Error in transport consume event", error)
    }
  });
}