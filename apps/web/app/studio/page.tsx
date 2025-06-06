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

type TransportType = {
  id: string;
  socketId: string;
  type: string;
};

export default function Studio() {
  const socketRef = useRef<Socket | null>(null);

  const roomId = useMediasoupStore((state) => state.roomId);
  const setRoomId = useMediasoupStore((state) => state.setRoomId);
  const socketId = useMediasoupStore((state) => state.socketId);
  const setSocketId = useMediasoupStore((state) => state.setSocketId);

  const [transports, setTransports] = useState<TransportType[]>([]);

  // const [producers, setProducers] = useState([]);
  // const [consumers, setConsumers] = useState([]);

  let device: mediasoupClient.types.Device;
  let sendTransport: mediasoupClient.types.Transport;
  let recvTransport: mediasoupClient.types.Transport;

  useEffect(() => {
    console.log("transports", transports);
  }, transports);

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

      const newRoomId = short().generate();
      setRoomId(newRoomId);

      socket.emit("join-room", roomId);

      socket.emit(
        "getRtpCapabilities",
        { roomId: roomId },
        async (rtpCapabilities: mediasoupClient.types.RtpCapabilities) => {
          try {
            // add error catch
            device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: rtpCapabilities });

            socket.emit(
              "createSendTransport",
              { roomId: roomId },
              async (
                transportOptions: mediasoupClient.types.TransportOptions,
              ) => {
                try {
                  console.log("inside send trans");
                  console.log(transportOptions);
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

            socket.emit(
              "createRecvTransport",
              async (
                transportOptions: mediasoupClient.types.TransportOptions,
              ) => {
                recvTransport = device.createRecvTransport({
                  ...transportOptions,
                  iceServers: [
                    {
                      urls:
                        process.env.NEXT_PUBLIC_STUN_SERVER_URL ||
                        "stun:stun.l.google.com:19302",
                    },
                  ],
                });

                recvTransport.on("connect", ({ dtlsParameters }, callback) => {
                  socket.emit(
                    "recv-transport-connect",
                    { socketId, dtlsParameters },
                    ({ id }: { id: string }) => {},
                  );
                });
              },
            );

            // socket.on(
            //   "new-producer",
            //   async ({
            //     id,
            //     type,
            //     mediaType,
            //     socketId,
            //   }: {
            //     id: string;
            //     type: string;
            //     mediaType: string;
            //     socketId: string;
            //   }) => {
            //     if (id === sendTransport.id) {
            //       return;
            //     }

            //     socket.emit(
            //       "transport-consume",
            //       {
            //         id: id,
            //         socketId: socketId,
            //         rtpCapabilities: device.rtpCapabilities,
            //       },
            //       (data: any) => {},
            //     );
            //   },
            // );
          } catch (error) {
            console.error("Error occured in RtpCapabilities", error);
          }
        },
      );

      socket.on("send-transport-data", ({ id, socketId, type }) => {
        const transportExist = transports.find((t) => t.id === id);
        if (!transportExist) {
          setTransports([...transports, { id, socketId, type }]);
        }
      });
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
