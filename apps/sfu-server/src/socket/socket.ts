import { Server } from "socket.io";
import { auth } from "@repo/auth/auth";
import { fromNodeHeaders } from "better-auth/node";
import getRtpCapabilities from "./handlers/getRtpCapabilities";
import joinRoom from "./handlers/room/joinRoom";
import createRoom from "./handlers/room/createRoom";
import sendTransportHandler from "./handlers/transport/sendTransportHandler";
import produceHandler from "./handlers/producer/produceHandler";
import recvTransportHandler from "./handlers/transport/recvTransportHandler";
import consumeHandler from "./handlers/consumer/consumeHandler";
import getAllProducers from "./handlers/consumer/getAllProducers";
import consumerResumeHandler from "./handlers/consumer/consumerResumeHandler";
import { disconnectCleanup } from "./handlers/disconnect";

export async function setupSocket(io: Server) {

  io.on("connection", (socket) => {
    createRoom(socket)
    joinRoom(socket);
    getRtpCapabilities(socket);
    sendTransportHandler(socket);
    produceHandler(socket);

    recvTransportHandler(socket);
    consumeHandler(socket);
    getAllProducers(socket);
    consumerResumeHandler(socket);

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
      disconnectCleanup(socket)
    });
  });

  // socket.io middleware run for every incoming connection 
  io.use((socket, next) => {
    async function authenticate() {
      try {
        if (socket.data.session) {
          return next()
        }

        const session = await auth.api.getSession({
          headers: fromNodeHeaders(socket.handshake.headers)
        });

        if (!session || session === null) {
          console.log("no session")
          return next(new Error("Invalid Session: Disconnected"))
        }

        socket.data.session = session
        next()
      } catch (error) {
        console.log("Auth error", error)
        next(new Error("Unauthorized"));
      }
    }

    authenticate()
  })
}