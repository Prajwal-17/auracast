import { Server } from "socket.io";
import { v4 as uuid } from "uuid"
import { mediasoupState } from "../mediasoup/mediasoupState";
import { getRecvTransport, getRouter, getSendTransport } from "../mediasoup/utils";
import { createRouter } from "../mediasoup/router";
import { sendTransportFnc } from "../mediasoup/sendTransport";
import { recvTransportFnc } from "../mediasoup/recvTransport";

export async function setupSocket(io: Server) {

  setInterval(() => {
    // console.log("worker", mediasoupState.worker)
    console.log("routers", mediasoupState.router.keys())
    console.log("producers", mediasoupState.producers.keys());
    console.log("consumers", mediasoupState.consumers.keys());
    console.log("transports", mediasoupState.transports.keys())
  }, 2000);

  io.on("connection", (socket) => {

    socket.on("join-room", async (roomId) => {
      try {
        socket.join(roomId)
        await createRouter(roomId)
      } catch (error) {
        console.error("Error joining room", error)
      }
    });

    socket.on("getRtpCapabilities", async (roomId, callback) => {
      try {
        const router = await createRouter(roomId);

        if (!router) {
          throw new Error("Router creation failed");
        }
        callback(router?.rtpCapabilities);
      } catch (error) {
        console.log(error)
      }
    });

    socket.on("createSendTransport", async (roomId, callback) => {
      try {
        console.log("inside")
        const sendTransportData = await sendTransportFnc(roomId)

        if (!sendTransportData) {
          throw new Error("Failed to create WebRTC send transport.");
        }
        console.log(sendTransportData)
        callback(sendTransportData)
      } catch (error) {
        console.log("Error occured while creating send Transport", error)
      }
    });

    socket.on("send-transport-connect", async (socketId, dtlsParameters, callback) => {
      try {
        const sendTransport = getSendTransport(socketId);
        await sendTransport?.connect({ dtlsParameters });
        socket.emit("send-transport-data", {
          id: sendTransport?.id,
          socketId: socketId,
          type: "send-tranport",
        })
        callback();
      } catch (error) {
        console.error("Error connecting Send Transport", error)
      }
    });

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

    socket.on("createRecvTransport", async (roomId, callback) => {
      try {
        console.log("createrecv transpor")
        const recvTransportData = await recvTransportFnc(roomId)

        if (!recvTransportData) {
          throw new Error("Failed to create WebRTC Recv transport.");
        }
        callback(recvTransportData)
      } catch (error) {
        console.log("Error occured while creating recv Transport", error)
      }
    });

    socket.on("recv-transport-connect", async (socketId, dtlsParameters, callback) => {
      try {
        const recvTransport = getRecvTransport(socketId);
        await recvTransport?.connect({ dtlsParameters });
        callback();
      } catch (error) {
        console.error("Error connecting Recv Transport", error)
      }
    })

    // socket.on (consume)

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });

  });
}