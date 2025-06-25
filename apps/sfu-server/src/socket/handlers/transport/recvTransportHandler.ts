import { Socket } from "socket.io";
import { recvTransportFnc } from "../../../mediasoup/recvTransport";
import { getRecvTransport } from "../../../mediasoup/utils";

export default function recvTransportHandler(socket: Socket) {
  socket.on("createRecvTransport", async (roomId, callback) => {
    try {
      const recvTransportOptions = await recvTransportFnc(socket.id, roomId)

      if (!recvTransportOptions) {
        throw new Error("Failed to create WebRTC Recv transport.");
      }
      callback(recvTransportOptions)
    } catch (error) {
      console.log("Error occured while creating recv Transport", error)
    }
  });

  socket.on("recv-transport-connect", async ({ roomId, recvTransportId, dtlsParameters }, callback) => {
    try {
      const recvTransport = getRecvTransport(roomId, recvTransportId);
      await recvTransport?.connect({ dtlsParameters });
      callback();
    } catch (error) {
      console.error("Error connecting Recv Transport", error)
      callback();
    }
  })
}