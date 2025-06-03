"use client";

import { Button } from "@/components/ui/button";
import { connectSocket, disconnectSocket, socketInstance } from "../socket";
import { useEffect, useRef, useState } from "react";
import short from "short-uuid";
import { Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

export default function Studio() {
  const socketRef = useRef<Socket | null>(null);

  const [socketId, setSocketId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  let device: mediasoupClient.types.Device;
  let sendTransport: mediasoupClient.types.Transport;

  // add auth check in socket
  useEffect(() => {
    socketRef.current = socketInstance;
    connectSocket();

    const socket = socketRef.current;

    socket.on("connect", () => {
      if (socket.id) {
        setSocketId(socket.id);
      } else {
        console.warn("Socket Id is not defined");
      }
    });

    socket.on("error", (err) => {
      console.error(err);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  async function startCall() {
    try {
      const socket = socketRef.current;

      if (!socket) {
        console.warn("Socket not initialized yet");
        return;
      }

      setRoomId(short().generate());
      socket.emit("join-room", roomId);

      socket.emit(
        "getRtpCapabilities",
        { roomId: roomId },
        async (rtpCapabilities: mediasoupClient.types.RtpCapabilities) => {
          try {
            device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: rtpCapabilities });

            socket.emit(
              "createSendTransport",
              { roomId: roomId },
              async (
                transportOptions: mediasoupClient.types.TransportOptions,
              ) => {
                try {
                  sendTransport = device.createSendTransport({
                    ...transportOptions,
                    iceServers: [
                      {
                        urls:
                          process.env.NEXT_PUBLIC_STUN_SERVER_URL ||
                          "stun:stun.l.google.com:19302",
                      },
                    ],
                  });

                  sendTransport.on(
                    "connect",
                    ({ dtlsParameters }, callback) => {
                      socket.emit(
                        "send-trasnport-connect",
                        { socketId, dtlsParameters },
                        callback,
                      );
                    },
                  );
                } catch (error) {
                  console.log(error);
                }
              },
            );
          } catch (error) {
            console.error("Error occured in RtpCapabilities", error);
          }
        },
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div>
        <div>Welcome to studio</div>
        <Button onClick={startCall}>Start Call</Button>
      </div>
    </>
  );
}
