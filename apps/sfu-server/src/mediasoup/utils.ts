import { mediasoupState } from "./mediasoupState";

export function getRouter(roomId: string) {
  const router = mediasoupState.router.get(roomId)
  if (!router) {
    console.error("Router not found")
  }
  return router;
}

export function getSendTransport(sendTransportId: string) {
  const sendTransport = mediasoupState.transports.get(sendTransportId)
  if (!sendTransport) {
    console.error("Send Transport not found")
  }
  return sendTransport;
}

export function getRecvTransport(recvTransportId: string) {
  const recvTransport = mediasoupState.transports.get(recvTransportId)
  if (!recvTransport) {
    console.error("Send Transport not found")
  }
  return recvTransport;
}

export function getProducer(producerId: string) {
  const producer = mediasoupState.producers.get(producerId);
  if (!producer) {
    console.error("Consumer not found")
  }
  return producer;
}

export function getConsumer(consumerId: string) {
  const consumer = mediasoupState.consumers.get(consumerId);
  if (!consumer) {
    console.error("Consumer not found")
  }
  return consumer;
}