import { mediasoupState } from "./mediasoupState";

export function getRoom(roomId: string) {
  const room = mediasoupState.room.get(roomId);
  if (!room) {
    console.error("Room not found")
  }
  return room;
}

export function getRouter(roomId: string) {
  const router = getRoom(roomId)?.router;
  if (!router) {
    console.error("Router not found")
  }
  return router;
}

export function getSendTransport(roomId: string, sendTransportId: string) {
  const room = getRoom(roomId);
  const sendTransport = room?.transports.get(sendTransportId);
  if (!sendTransport) {
    console.error("Send Transport not found")
  }
  return sendTransport;
}

export function getRecvTransport(roomId: string, recvTransportId: string) {
  const room = getRoom(roomId);
  const recvTransport = room?.transports.get(recvTransportId)
  if (!recvTransport) {
    console.error("Send Transport not found")
  }
  return recvTransport;
}

export function getProducer(roomId: string, producerId: string) {
  const room = getRoom(roomId);
  const producer = room?.producers.get(producerId);
  if (!producer) {
    console.error("Consumer not found")
  }
  return producer;
}

export function getConsumer(roomId: string, consumerId: string) {
  const room = getRoom(roomId);
  const consumer = room?.consumers.get(consumerId)
  if (!consumer) {
    console.error("Consumer not found")
  }
  return consumer;
}