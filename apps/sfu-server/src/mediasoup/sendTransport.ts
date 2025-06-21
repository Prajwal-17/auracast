import { getRoom } from "./utils";

export async function sendTransportFnc(socketId: string, roomId: string, userId: string) {
  try {
    const room = getRoom(roomId);
    const router = room?.router;

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
    room?.transports.set(sendTransportId, sendTransport)



    room?.peers.set(socketId, {
      userId: userId,
      transports: new Set(),
      producers: new Set(),
      consumers: new Set()
    });
    const peer = room?.peers.get(socketId)
    peer?.transports.add(sendTransportId)

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