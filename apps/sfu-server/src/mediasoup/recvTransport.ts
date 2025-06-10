import { mediasoupState } from "./mediasoupState";
import { getRoom, getRouter } from "./utils";

export async function recvTransportFnc(roomId: string) {
  try {
    const room = getRoom(roomId)
    const router = room?.router;

    const recvTransport = await router?.createWebRtcTransport({
      listenIps: [
        {
          ip: process.env.MEDIASOUP_LISTEN_IPV4 as string,
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IPV4 as string,
        },
        {
          ip: process.env.MEDIASOUP_LISTEN_IPV6 as string,
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IPV6 as string
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
    room?.transports.set(recvTransportId, recvTransport);

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