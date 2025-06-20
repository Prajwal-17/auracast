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
import { authClient } from "@/lib/auth-client";

export default function Studio() {
  const socketRef = useRef<Socket | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const opponentRef = useRef<HTMLVideoElement>(null);
  // const roomIdRef = useRef<string>(null);

  const socketId = useMediasoupStore((state) => state.socketId);
  const setSocketId = useMediasoupStore((state) => state.setSocketId);

  const [roomId, setRoomId] = useState("");

  let device: mediasoupClient.types.Device;
  let sendTransport: mediasoupClient.types.Transport;
  let recvTransport: mediasoupClient.types.Transport;
  let videoConsumer: mediasoupClient.types.Consumer;

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

  async function authenticate() {
    try {
      // const { data: session } = await authClient.getSession();
      // console.log("session",session);
      console.log("inside");
      const response = await fetch("http://localhost:3001/health", {
        method: "GET",
        credentials: "include",
      });
      const responsedata = await response.json();

      console.log(responsedata);
    } catch (error) {
      console.log(error);
    }
  }

  async function createRoom() {
    try {
      const socket = socketRef.current;

      if (!socket) {
        console.warn("Socket not initialized yet");
        return;
      }

      const newRoomId = short().generate();
      setRoomId(newRoomId);
      await socket.timeout(6000).emitWithAck("create-room", newRoomId);
      startCall(newRoomId);
    } catch (error) {
      console.log(error);
    }
  }

  async function joinRoom(roomId: string) {
    try {
      const socket = socketRef.current;

      if (!socket) {
        console.warn("Socket not initialized yet");
        return;
      }
      await socket.timeout(6000).emitWithAck("join-room", roomId);
      startCall(roomId);
    } catch (error) {
      console.log(error);
    }
  }

  async function startCall(roomId: string) {
    try {
      const socket = socketRef.current;

      if (!socket) {
        console.warn("Socket not initialized yet");
        return;
      }

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
            roomId,
            sendTransportId,
            dtlsParameters,
          });

          // error check
          callback();
        } catch (error) {
          console.log(error);
        }
      });

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
          const value = await socket
            .timeout(6000)
            .emitWithAck("recv-transport-connect", {
              roomId,
              recvTransportId,
              dtlsParameters,
            });

          callback();
        } catch (error) {
          console.log("Error occured in recvTransport connection", error);
        }
      });

      sendTransport.on(
        "produce",
        async ({ kind, rtpParameters }, mediasoupCallback) => {
          try {
            const producerId = await socket
              .timeout(6000)
              .emitWithAck("transport-produce", {
                roomId,
                sendTransportId,
                kind,
                rtpParameters,
              });

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

      socket.on("new-producer", async ({ producerId, producerSocketId }) => {
        try {
          if (socketId === producerSocketId) {
            return;
          }

          await consume(producerId);
        } catch (error) {
          console.log("Error occured in consume", error);
        }
      });

      const { allProducers } = await socket
        .timeout(7000)
        .emitWithAck("getAllProducers", {
          roomId,
          socketId,
        });

      if (allProducers.length <= 0) {
        return;
      }

      for (const prod of allProducers) {
        await consume(prod);
      }

      async function consume(prod: string) {
        try {
          const consumerData = await socket
            ?.timeout(10000)
            .emitWithAck("transport-consume", {
              roomId,
              recvTransportId,
              producerId: prod,
              producerSocketId: socketId,
              rtpCapabilities: device.rtpCapabilities,
            });

          const consumer = await recvTransport.consume({
            id: consumerData.id,
            producerId: consumerData.producerId,
            kind: consumerData.kind,
            rtpParameters: consumerData.rtpParameters,
          });

          // check for consumer

          const resumeResponse = await socket
            ?.timeout(8000)
            .emitWithAck("consumer-resume", {
              roomId: roomId,
              consumerId: consumer.id,
            });

          if (!resumeResponse.success) {
            consumer.resume();
          }

          if (consumer.kind === "video") {
            videoConsumer = consumer;
          }

          if (consumer.kind === "video" && opponentRef.current) {
            const stream = new MediaStream([videoConsumer.track]);
            opponentRef.current.srcObject = stream;
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.error("Webrtc init failed", error);
    }
  }

  return (
    <>
      <div>
        <div>Welcome to studio</div>
        {/* <Button onClick={startCall}>Start Call</Button> */}
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
        <div>
          <video
            ref={opponentRef}
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
            Opponent Video
          </div>
        </div>

        <div>
          <div>
            <input
              type="text"
              value={roomId}
              className="border-2"
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <Button onClick={() => joinRoom(roomId)}>Join Room</Button>
          <Button onClick={authenticate} className="my-4">
            authenticate
          </Button>
          {roomId && <div>{roomId}</div>}
          {roomId && <div>{roomId}</div>}
        </div>
      </div>
    </>
  );
}
