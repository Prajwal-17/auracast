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
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const roomIdRef = useRef<string>(null);

  const socketId = useMediasoupStore((state) => state.socketId);
  const setSocketId = useMediasoupStore((state) => state.setSocketId);

  let device: mediasoupClient.types.Device;
  let sendTransport: mediasoupClient.types.Transport;
  let recvTransport: mediasoupClient.types.Transport;

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
      roomIdRef.current = newRoomId;
      const roomId = roomIdRef.current;

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

      const sendTransportId = sendTransport.id;
      sendTransport.on("connect", async ({ dtlsParameters }, callback) => {
        try {
          await socket.timeout(6000).emitWithAck("send-transport-connect", {
            sendTransportId,
            dtlsParameters,
          });

          // error check

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
                sendTransportId,
                kind,
                rtpParameters,
              });
            console.log("producer id ", producerId);

            mediasoupCallback(producerId);
          } catch (error) {
            console.log(error);
          }
        },
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      await sendTransport.produce({ track: videoTrack });
      await sendTransport.produce({ track: audioTrack });

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

      const recvTransportId = recvTransport.id;
      recvTransport.on("connect", async ({ dtlsParameters }, callback) => {
        try {
          await socket.timeout(6000).emitWithAck("recv-transport-connect", {
            recvTransportId,
            dtlsParameters,
          });

          callback();
        } catch (error) {
          console.log("Error occured in recvTransport connection", error);
        }
      });

      socket.on("new-producer", async ({ producerId, producerSocketId }) => {
        try {
          if (producerSocketId === socketId) {
            return;
          }

          const recvTransportId = recvTransport.id;
          const consumerData = await socket
            .timeout(6000)
            .emitWithAck("transport-consume", {
              roomId,
              recvTransportId,
              producerId,
              rtpCapabilities: device.rtpCapabilities,
            });

          const consumer = await recvTransport.consume({
            producerId: consumerData.producerId,
            id: consumerData.id,
            kind: consumerData.kind,
            rtpParameters: consumerData.rtpParameters,
          });

          // check for consumer

          const resumeResponse = await socket
            .timeout(6000)
            .emitWithAck("consumer-resume", consumerData.id);

          if (!resumeResponse.success) {
            consumer.resume();
          }
        } catch (error) {
          console.log("Error occured in consume", error);
        }
      });
    } catch (error) {
      console.error("Webrtc init failed", error);
    }
  }

  return (
    <>
      <div>
        <div>Welcome to studio</div>
        <Button onClick={startCall}>Start Call</Button>
        <div>
          <video
            ref={myVideoRef}
            muted
            autoPlay
            playsInline
            style={{
              width: "300px",
              margin: "5px",
              height: "auto",
              transform: "scaleX(-1)", // Mirror effect
              display: "block",
            }}
          />
          <div className="m-4 inline-block rounded-lg bg-black p-3 text-white">
            My Video
          </div>
        </div>
      </div>
    </>
  );
}
