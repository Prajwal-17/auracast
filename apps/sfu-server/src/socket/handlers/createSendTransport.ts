import { Socket } from "socket.io";
import { sendTransportFnc } from "../../mediasoup/sendTransport";
import { getSendTransport } from "../../mediasoup/utils";

export function createSendTransport(socket: Socket) {
  socket.on("createSendTansport", async (roomId, callback) => {
    try {
      const sendTransportData = await sendTransportFnc(roomId)

      if (!sendTransportData) {
        throw new Error("Failed to create WebRTC send transport.");
      }
      callback(sendTransportData)
    } catch (error) {
      console.log("Error occured while creating send Transport", error)
    }
  });

  socket.on("send-transport-connect", async (socketId, dtlsParameters, callback) => {
    try {
      const sendTransport = getSendTransport(socketId);
      await sendTransport?.connect({ dtlsParameters });
      callback();
    } catch (error) {
      console.error("Error connecting Send Transport", error)
    }
  })
}