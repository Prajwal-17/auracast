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

      await socket.timeout(6000).emitWithAck("join-room", roomId);

      const rtpCapabilities = await socket
        .timeout(6000)
        .emitWithAck("getRtpCapabilities", roomId);

      // check rtp cap

      device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });

      const sendTransportOptions = await socket
        .timeout(6000)
        .emitWithAck("createSendTransport", roomId);

      // check for send transport

      sendTransport = device.createSendTransport({
        ...sendTransportOptions,
        iceServers: [
          {
            urls:
              process.env.NEXT_PUBLIC_STUN_SERVER_URL ||
              "stun:stun.l.google.com:19302",
          },
        ],
      });

      sendTransport.on("connect", async ({ dtlsParameters }, callback) => {
        try {
          await socket.timeout(6000).emitWithAck("send-transport-connect", {
            socketId,
            dtlsParameters,
          });

          // error check here

          callback();
        } catch (error) {
          console.log(error);
        }
      });

      sendTransport.on(
        "produce",
        async ({ kind, rtpParameters }, mediasoupCallback) => {
          try {
            const producerId = await socket
              .timeout(6000)
              .emitWithAck("transport-produce", {
                socketId,
                kind,
                rtpParameters,
              });
            console.log("producer", producerId);

            mediasoupCallback(producerId);
          } catch (error) {
            console.log(error);
          }
        },
      );

      const stream = navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // create recv transrpot

      const recvTransportOptions = await socket
        .timeout(6000)
        .emitWithAck("createRecvTransport", roomId);

      recvTransport = device.createRecvTransport({
        ...recvTransportOptions,
        iceServers: [
          {
            urls:
              process.env.NEXT_PUBLIC_STUN_SERVER_URL ||
              "stun:stun.l.google.com:19302",
          },
        ],
      });

      recvTransport.on("connect", async ({ dtlsParameters }, callback) => {
        try {
          await socket.timeout(6000).emitWithAck("recv-transport-connect", {
            socketId,
            dtlsParameters,
          });

          callback();
        } catch (error) {
          console.log("Error occured in recvTransport connection", error);
        }
      });

      // socket new producer

      //socket new producer data
      //socket new consumer data
    } catch (error) {
      console.error("Webrtc init failed", error);
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
