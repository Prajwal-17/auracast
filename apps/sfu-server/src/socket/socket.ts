import { mediasoupState } from "@/mediasoup/mediasoupState";
import { createRouter } from "@/mediasoup/router";
import { sendTransportFnc } from "@/mediasoup/sendTransport";
import { getRouter, getSendTransport } from "@/mediasoup/utils";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid"
import { handleRoomJoin } from "./handlers/joinRoom";
import { createSendTransport } from "./handlers/createSendTransport";
import { transportProduce } from "./handlers/transportProduce";
import { handleDisconnect } from "./handlers/disconnect";
import handleGetRtpCapabilities from "./handlers/getRtpCapabilities";

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    handleRoomJoin(socket);
    handleGetRtpCapabilities(socket);
    createSendTransport(socket);
    transportProduce(socket);
    handleDisconnect(socket)
  });
}