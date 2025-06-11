import { Server } from "socket.io";
import { getConsumer, getProducer, getRecvTransport, getRoom, getRouter, getSendTransport } from "../mediasoup/utils";
import { createRouter } from "../mediasoup/router";
import { sendTransportFnc } from "../mediasoup/sendTransport";
import { recvTransportFnc } from "../mediasoup/recvTransport";

export async function setupSocket(io: Server) {

  io.on("connection", (socket) => {

    socket.on("create-room", async (roomId, callback) => {
      try {
        await socket.join(roomId)
        await createRouter(roomId)
        callback()
      } catch (error) {
        console.error("Error joining room", error)
      }
    });

    socket.on("join-room", async (roomId, callback) => {
      try {
        await socket.join(roomId)
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
        const sendTransportData = await sendTransportFnc(socket.id, roomId)

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

    socket.on("transport-produce", async ({ roomId, sendTransportId, kind, rtpParameters }, callback) => {
      try {
        const room = getRoom(roomId);
        const router = room?.router;
        const sendTransport = getSendTransport(roomId, sendTransportId);
        const producer = await sendTransport?.produce({ kind, rtpParameters, appData: { routerId: router?.id, socketId: socket.id } })

        if (!producer) {
          console.error("No producer found");
          return
        }

        const producerId = producer.id
        room?.producers.set(producerId, producer)
        const peer = room?.peers.get(socket.id);
        peer?.producers.add(producerId);

        io.to(roomId).emit("new-producer", {
          producerId: producerId,
          producerSocketId: socket.id
        })
        callback(producerId);
      } catch (error) {
        console.error("Error producing stream", error)
      }
    })

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

    socket.on("transport-consume", async ({ roomId, recvTransportId, producerId, producerSocketId, rtpCapabilities }, callback) => {
      try {
        const room = getRoom(roomId);
        const router = room?.router;
        const recvTransport = getRecvTransport(roomId, recvTransportId)
        const peer = room?.peers.get(socket.id);

        if (!router?.canConsume({ producerId, rtpCapabilities })) {
          console.log("cannot consume")
          return;
        }

        const consumer = await recvTransport?.consume({
          producerId,
          rtpCapabilities,
          paused: true
        })

        if (!consumer) {
          console.error("Consumer cannot be created")
          return;
        }

        const consumerId = consumer.id;
        room?.consumers.set(consumerId, consumer)
        const peerConsumersSet = room?.peerConsumers.get(socket.id) ?? new Set();
        if (!room?.peerConsumers.has(socket.id)) {
          room?.peerConsumers.set(socket.id, peerConsumersSet)
        }
        peerConsumersSet.add(producerId)

        callback({
          id: consumerId,
          producerId: producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters
        });
      } catch (error) {
        console.error("Error in transport consume event", error)
      }
    });

    socket.on("getAllProducers", async ({ roomId, socketId }, callback) => {
      const room = getRoom(roomId);
      const peer = room?.peers.get(socketId)
      const producerIds = room?.producers.keys();

      if (!producerIds) {
        return
      }
      const filteredProducers = Array.from(producerIds).filter(p => !peer?.producers.has(p))
      callback({ allProducers: filteredProducers })
    })

    socket.on("consumer-resume", async ({ roomId, consumerId }, callback) => {
      const consumer = getConsumer(roomId, consumerId);
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