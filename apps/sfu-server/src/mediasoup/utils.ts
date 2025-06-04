import { mediasoupState } from "./mediasoupState";

export function getRouter(roomId: string) {
  const router = mediasoupState.router.get(roomId)
  if (!router) {
    console.error("Router not found")
  }
  return router;
}

export function getSendTransport(socketId: string) {
  const sendTransport = mediasoupState.transports.get(`send_${socketId}`)
  if (!sendTransport) {
    console.error("Send Transport not found")
  }
  return sendTransport;
}

export function getRecvTransport(socketId: string) {
  const recvTransport = mediasoupState.transports.get(`recv_${socketId}`)
  if (!recvTransport) {
    console.error("Send Transport not found")
  }
  return recvTransport;
}