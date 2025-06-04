import { mediasoupState } from "@/mediasoup/mediasoupState";
import { createRouter } from "@/mediasoup/router";
import { getRouter, getSendTransport } from "@/mediasoup/utils";
import { error } from "node:console";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid"

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {

    socket.on("join-room", async (roomId) => {
      try {
        await createRouter(roomId)
        socket.join(roomId)
      } catch (error) {
        console.error("Error joining room", error)
      }
    })
    console.log(socket.rooms)

    socket.on("getRtpCapabilities", (roomId, callback) => {
      const router = getRouter(roomId);
      callback(router?.rtpCapabilities)
    })

    socket.on("createSendTansport", async (roomId, callback) => {
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


        if (sendTransport) {
          mediasoupState.transports.set(`send_${uuid()}`, sendTransport)

          callback({
            id: sendTransport.id,
            iceCandidates: sendTransport.iceCandidates,
            iceParameters: sendTransport.iceParameters,
            dtlsParameters: sendTransport.dtlsParameters
          })
        } else {
          console.error("Could not create send transport")
        }
      } catch (error) {
        console.log("Error occured while creating send Transport", error)
      }
    })

    socket.on("send-transport-connect", async (socketId, dtlsParameters, callback) => {
      try {
        const sendTransport = getSendTransport(socketId);
        await sendTransport?.connect({ dtlsParameters });
        callback();
      } catch (error) {
        console.error("Error connecting Send Transport", error)
      }
    })

    socket.on("transport-produce", async ({ socketId, kind, rtpParameters }, callback) => {
      try {
        const sendTransport = getSendTransport(socketId);
        const producer = await sendTransport?.produce({ kind, rtpParameters })

        if (!producer) {
          console.error("No producer found");
          return
        }
        const producerId = `producer_${uuid()}`
        mediasoupState.producers.set(producerId, producer)

        socket.broadcast.emit("new-producer", {
          id: producerId,
          type: "producer",
          mediaType: "",
          socketId: socket.id
        });
        callback({ id: producerId });
      } catch (error) {
        console.error("Error producing stream", error)
      }
    })



    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
}
