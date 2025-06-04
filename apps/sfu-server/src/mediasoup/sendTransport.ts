import { mediasoupState } from "./mediasoupState";
import { getRouter } from "./utils";
import { v4 as uuid } from "uuid"

export async function sendTransportFnc(roomId: string) {
  try {
    const router = getRouter(roomId)
    const sendTransport = await router?.createWebRtcTransport({
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

    if (!sendTransport) {
      throw new Error("Failed to create send transport");
    }

    const sendTransportId = `send_${uuid()}`
    mediasoupState.transports.set(sendTransportId, sendTransport)

    return {
      id: sendTransport.id,
      iceCandidates: sendTransport.iceCandidates,
      iceParameters: sendTransport.iceParameters,
      dtlsParameters: sendTransport.dtlsParameters
    }
  } catch (error) {
    console.error("Error occured sendTransport", error)
  }
}