import { mediasoupState } from "./mediasoupState";
import { getRouter } from "./utils";
import { v4 as uuid } from "uuid"

export async function recvTransportFnc(roomId: string) {
  try {
    const router = getRouter(roomId)
    const recvTransport = await router?.createWebRtcTransport({
      listenIps: [
        {
          ip: "0.0.0.0"
          // announcedIp: "192.168.38.232",
        },
        {
          ip: "127.0.0.1"
          // announcedIp: "127.0.0.1",
        },
        {
          ip: "::1"
          // announcedIp: "::1",
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });

    if (!recvTransport) {
      throw new Error("Failed to create send transport");
    }

    const recvTransportId = `recv_${uuid()}`
    mediasoupState.transports.set(recvTransportId, recvTransport)

    return {
      id: recvTransport.id,
      iceCandidates: recvTransport.iceCandidates,
      iceParameters: recvTransport.iceParameters,
      dtlsParameters: recvTransport.dtlsParameters
    }
  } catch (error) {
    console.error("Error occured recvTransport", error)
  }
}