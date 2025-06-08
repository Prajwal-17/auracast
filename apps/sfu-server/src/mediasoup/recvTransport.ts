import { mediasoupState } from "./mediasoupState";
import { getRouter } from "./utils";

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
      appData: { routerId: router.id, type: "recv" },
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });

    if (!recvTransport) {
      throw new Error("Failed to create send transport");
    }

    const recvTransportId = recvTransport.id;
    mediasoupState.transports.set(recvTransportId, recvTransport);

    return {
      id: recvTransportId,
      iceCandidates: recvTransport.iceCandidates,
      iceParameters: recvTransport.iceParameters,
      dtlsParameters: recvTransport.dtlsParameters
    }
  } catch (error) {
    console.error("Error occured recvTransport", error)
  }
}