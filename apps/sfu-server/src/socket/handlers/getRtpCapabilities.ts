import { Socket } from "socket.io";
import { getRouter } from "@/mediasoup/utils";

export default function handleGetRtpCapabilities(socket: Socket) {
  socket.on("getRtpCapabilities", (roomId, callback) => {
    const router = getRouter(roomId);
    callback(router?.rtpCapabilities);
  });
}