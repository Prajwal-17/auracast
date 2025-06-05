"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import short from "short-uuid";
import { Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import {
  connectSocket,
  disconnectSocket,
  socketInstance,
} from "@/lib/socket/socket";
import { useMediasoupStore } from "@/store/mediasoupStore";

export default function Studio() {
  const socketRef = useRef<Socket | null>(null);

  const roomId = useMediasoupStore((state) => state.roomId);
  const setRoomId = useMediasoupStore((state) => state.setRoomId);
  const socketId = useMediasoupStore((state) => state.socketId);
  const setSocketId = useMediasoupStore((state) => state.setSocketId);

  const [producers, setProducers] = useState([]);
  const [consumers, setConsumers] = useState([]);

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
                        "send-transport-connect",
                        { socketId, dtlsParameters },
                        callback,
                      );
                    },
                  );

                  sendTransport.on(
                    "produce",
                    async ({ kind, rtpParameters }, callback) => {
                      try {
                        socket.emit(
                          "transport-produce",
                          { socketId, kind, rtpParameters },
                          ({ id }: { id: string }) => {
                            callback({ id });
                          },
                        );
                      } catch (error) {
                        console.error("Error while sending Transport", error);
                      }
                    },
                  );

                  const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                  });

                  // ------------------------------
                  // create recv Transport
                } catch (error) {
                  console.log(error);
                }
              },
            );

            socket.on("new-producer", (data) => {
              // store the data in state
              // consume
            });
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
