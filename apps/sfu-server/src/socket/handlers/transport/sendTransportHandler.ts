import { Socket } from "socket.io";
import { sendTransportFnc } from "../../../mediasoup/sendTransport";
import { getSendTransport } from "../../../mediasoup/utils";

export default function sendTransportHandler(socket: Socket) {
  socket.on("createSendTransport", async (roomId, callback) => {
    try {
      const userId = socket.data.session.user.id
      const sendTransportData = await sendTransportFnc(socket.id, roomId, userId)

      if (!sendTransportData) {
        throw new Error("Failed to create WebRTC send transport.");
      }

      callback(sendTransportData)
    } catch (error) {
      console.log("Error occured while creating send Transport", error)
    }
  });

  socket.on("send-transport-connect", async ({ roomId, sendTransportId, dtlsParameters }, callback) => {
    try {
      const sendTransport = getSendTransport(roomId, sendTransportId);
      await sendTransport?.connect({ dtlsParameters });
      callback();
    } catch (error) {
      console.error("Error connecting Send Transport", error)
    }
  });
}