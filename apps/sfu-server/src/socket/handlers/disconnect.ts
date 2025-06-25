import { Socket } from "socket.io";
import { mediasoupState } from "../../mediasoup/mediasoupState";

// export default function disconnectHandler(socket: Socket) {
export async function disconnectCleanup(socket: Socket) {
  try {
    const roomId = socket.data.roomId;
    if (!roomId) {
      console.log("No room id")
    }

    const room = mediasoupState.room.get(roomId)
    if (!room) {
      console.log("Room does not exist")
      return
    }

    const peer = room.peers.get(socket.id)
    if (!peer) {
      console.log("no peer exists")
      return
    }

    const transportKeys = [...peer.transports]
    const producerKeys = [...peer.producers]
    const consumerKeys = [...peer.consumers]

    transportKeys.forEach((id) => {
      const transport = room.transports.get(id);
      if (transport) {
        transport?.close();
        room.transports.delete(transport.id)
      }
    })

    producerKeys.forEach((id) => {
      const producer = room.producers.get(id);
      if (producer) {
        producer?.close();
        room.producers.delete(producer.id)
      }
    })

    consumerKeys.forEach((id) => {
      const consumer = room.consumers.get(id);
      if (consumer) {
        consumer?.close();
        room.consumers.delete(consumer.id)
      }
    })

    room.peerConsumers.delete(socket.id)

    room.peers.delete(socket.id)

    const shouldCloseRoom =
      room.producers.size === 0 &&
      room.consumers.size === 0;

    if (shouldCloseRoom) {
      room.router.close();
      mediasoupState.room.delete(roomId)
    }
  } catch (error) {
    console.log(error)
  }
}