"use client"

import { RefObject, useRef, useState } from "react";
import { mediasoupHandler } from "@/lib/mediasoupHandler";
import { RemoteStreamsType } from "../types";
import { Socket } from "socket.io-client";
import ShortUniqueId from "short-unique-id"

type useMediasoupWebrtc = {
  roomId: string,
  setRoomId: (roomId: string) => void,
  socketId: string | null,
  myVideoRef: RefObject<HTMLVideoElement | null>,
  createRoom: () => Promise<void>,
  joinRoom: (roomId: string) => Promise<void>,
  remoteStreamRef: RefObject<Map<string, MediaStream>>,
  remoteStreams: RemoteStreamsType[],
  localStream: MediaStream | undefined
}

export default function useMediasoupWebrtc(socketId: string | null, socketRef: RefObject<Socket | null>): useMediasoupWebrtc {
  const [roomId, setRoomId] = useState("");
  const myVideoRef = useRef<HTMLVideoElement>(null);

  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamsType[]>([]);
  const remoteStreamRef = useRef<Map<string, MediaStream>>(new Map());

  const [localStream, setLocalStream] = useState<MediaStream>()

  async function createRoom() {
    try {
      const socket = socketRef.current;

      if (!socket) {
        console.warn("Socket not initialized yet");
        return;
      }

      const newRoomId = new ShortUniqueId({ length: 6, dictionary: "alphanum_upper" })
      setRoomId(newRoomId.rnd());
      await socket.timeout(10000).emitWithAck("create-room", newRoomId);
      await startCall(newRoomId.rnd());
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
      await socket.timeout(10000).emitWithAck("join-room", roomId);
      await startCall(roomId);
    } catch (error) {
      console.log(error);
    }
  }

  const startCall = async (roomId: string) => {
    if (!socketRef.current || !socketId) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })

    setLocalStream(stream)

    await mediasoupHandler({
      socket: socketRef.current,
      socketId,
      roomId,
      remoteStreamRef,
      remoteStreams,
      setRemoteStreams,
      myVideoRef,
      localStream: stream
    })
  }

  return {
    roomId,
    setRoomId,
    socketId,
    myVideoRef,
    createRoom,
    joinRoom,
    remoteStreamRef,
    remoteStreams,
    localStream
  }
}