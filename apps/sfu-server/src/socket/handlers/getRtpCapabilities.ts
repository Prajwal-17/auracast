import { Socket } from "socket.io";
import { getRouter } from "../../mediasoup/utils";

export default function getRtpCapabilities(socket: Socket) {
  socket.on("getRtpCapabilities", async (roomId: string, callback) => {
    try {
      const router = getRouter(roomId)

      if (!router) {
        throw new Error("Router creation failed");
      }
      callback(router.rtpCapabilities);
    } catch (error) {
      console.log(error)
    }
  });
}