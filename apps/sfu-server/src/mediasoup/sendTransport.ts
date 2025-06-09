import { mediasoupState } from "./mediasoupState";
import { getRouter } from "./utils";

export async function sendTransportFnc(roomId: string) {
  try {
    const router = getRouter(roomId)

    const sendTransport = await router?.createWebRtcTransport({
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
      appData: { routerId: router.id, type: "send" },
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });

    if (!sendTransport) {
      throw new Error("Failed to create send transport");
    }

    const sendTransportId = sendTransport.id;
    mediasoupState.transports.set(sendTransportId, sendTransport);

    return {
      id: sendTransportId,
      iceCandidates: sendTransport.iceCandidates,
      iceParameters: sendTransport.iceParameters,
      dtlsParameters: sendTransport.dtlsParameters
    }
  } catch (error) {
    console.error("Error occured sendTransport", error)
  }
}