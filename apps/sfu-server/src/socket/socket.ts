import { Server } from "socket.io";
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