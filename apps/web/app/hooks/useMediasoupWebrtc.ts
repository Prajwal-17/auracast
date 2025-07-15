"use client"

import { RefObject, useEffect, useRef, useState } from "react";
import { mediasoupHandler } from "@/lib/mediasoupHandler";
import { RemoteStreamsType } from "../types";
import { Socket } from "socket.io-client";
import { useCallStore } from "@/store/useCallStore";

type useMediasoupWebrtc = {
  roomId: string,
  setRoomId: (roomId: string) => void,
  socketId: string | null,
  myVideoRef: RefObject<HTMLVideoElement | null>,
  createRoom: (roomId: string) => Promise<void>,
  joinRoom: (roomId: string) => Promise<void>,
  remoteStreamRef: RefObject<Map<string, MediaStream>>,
  remoteStreams: RemoteStreamsType[],
  localStream: MediaStream | undefined
}

export default function useMediasoupWebrtc(role: string, socketId: string, socketRef: RefObject<Socket | null>): useMediasoupWebrtc {

  const roomId = useCallStore((state) => state.roomId)
  const setRoomId = useCallStore((state) => state.setRoomId)
  const localStream = useCallStore((state) => state.localStream)
  const setLocalStream = useCallStore((state) => state.setLocalStream)
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamsType[]>([]);
  const remoteStreamRef = useRef<Map<string, MediaStream>>(new Map());

  const myVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setupCall = async () => {
      if (role === "host") {
        await createRoom(roomId);
      } else if (role === "participant") {
        await joinRoom(roomId);
      }
    }
    setupCall()
  }, [role, roomId, socketId, socketRef])

  async function createRoom(roomId: string) {
    try {
      const socket = socketRef.current;

      if (!socket) {
        console.warn("Socket not initialized yet");
        return;
      }
      await socket.timeout(10000).emitWithAck("create-room", roomId);
      await startCall(roomId);
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
    if (!socketRef.current || !socketId) {
      console.log("socker ref", socketRef.current)
      console.warn("no socket Ref or socketId")
      return;
    };

    if (!localStream) {
      console.log("local stream null")
      return
    }

    await mediasoupHandler({
      socket: socketRef.current,
      socketId,
      roomId,
      remoteStreamRef,
      remoteStreams,
      setRemoteStreams,
      myVideoRef,
      localStream: localStream
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
