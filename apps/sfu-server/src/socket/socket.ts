import { Server } from "socket.io";
import { v4 as uuid } from "uuid"
import { mediasoupState } from "../mediasoup/mediasoupState";
import { getConsumer, getRecvTransport, getRouter, getSendTransport } from "../mediasoup/utils";
import { createRouter } from "../mediasoup/router";
import { sendTransportFnc } from "../mediasoup/sendTransport";
import { recvTransportFnc } from "../mediasoup/recvTransport";
import * as mediasoup from "mediasoup"

export async function setupSocket(io: Server) {

  // setInterval(() => {
  // console.log("worker", mediasoupState.worker)
  // console.log("routers", mediasoupState.router.keys())
  // console.log("producers", mediasoupState.producers.keys());
  // console.log("consumers", mediasoupState.consumers.keys());
  // console.log("transports", mediasoupState.transports.keys())
  // }, 2000);

  io.on("connection", (socket) => {

    socket.on("join-room", async (roomId, callback) => {
      try {
        socket.join(roomId)
        await createRouter(roomId)
        callback()
      } catch (error) {
        console.error("Error joining room", error)
      }
    });

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

    socket.on("createSendTransport", async (roomId, callback) => {
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

    socket.on("send-transport-connect", async ({ sendTransportId, dtlsParameters }, callback) => {
      try {
        const sendTransport = getSendTransport(sendTransportId);
        await sendTransport?.connect({ dtlsParameters });
        callback();
      } catch (error) {
        console.error("Error connecting Send Transport", error)
      }
    });

    socket.on("transport-produce", async ({ sendTransportId, kind, rtpParameters }, callback) => {
      try {
        const sendTransport = getSendTransport(sendTransportId);
        const producer = await sendTransport?.produce({ kind, rtpParameters })

        if (!producer) {
          console.error("No producer found");
          return
        }

        const producerId = producer.id
        mediasoupState.producers.set(producerId, producer)

        socket.broadcast.emit("new-producer", {
          id: producerId,
          socketId: socket.id
        });
        callback(producerId);
      } catch (error) {
        console.error("Error producing stream", error)
      }
    })

    socket.on("createRecvTransport", async (roomId, callback) => {
      try {
        const recvTransportOptions = await recvTransportFnc(roomId)

        if (!recvTransportOptions) {
          throw new Error("Failed to create WebRTC Recv transport.");
        }
        callback(recvTransportOptions)
      } catch (error) {
        console.log("Error occured while creating recv Transport", error)
      }
    });

    socket.on("recv-transport-connect", async ({ recvTransportId, dtlsParameters }, callback) => {
      try {
        const recvTransport = getRecvTransport(recvTransportId);
        await recvTransport?.connect({ dtlsParameters });
        callback();
      } catch (error) {
        console.error("Error connecting Recv Transport", error)
      }
    })

    socket.on("transport-consume", async ({ roomId, recvTransportId, producerId, rtpCapabilities }, callback) => {
      try {
        const recvTransport = getRecvTransport(recvTransportId)
        const router = getRouter(roomId)

        if (!router?.canConsume({ producerId, rtpCapabilities })) {
          console.error("The router cannont consume");
          return;
        }

        const consumer = await recvTransport?.consume({
          producerId,
          rtpCapabilities,
          paused: false
        });

        if (!consumer) {
          console.error("Consumer cannot be created")
          return;
        }

        const consumerId = consumer.id;
        mediasoupState.consumers.set(consumerId, consumer)

        callback({
          id: consumerId,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters
        });
      } catch (error) {
        console.error("Error in transport consume event", error)
      }
    });

    socket.on("consumer-resume", async (consumerId, callback) => {
      console.log("inside resume");
      const consumer = getConsumer(consumerId);
      if (consumer) {
        await consumer.resume();
      }
      callback({ success: true })
    })

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });

  });
}