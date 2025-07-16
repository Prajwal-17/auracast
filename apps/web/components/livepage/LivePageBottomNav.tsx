"use client";

import {
  Disc2,
  LayoutGrid,
  MessageSquareText,
  Mic,
  MicOff,
  MonitorUp,
  Phone,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "../ui/button";
import { toggleAudio, toggleVideo } from "@/lib/videoUtils";
import { useMediaControlsStore } from "@/store/mediaControlsStore";
import { disconnectSocket } from "@/lib/socket/socket";
import { useMediasoupStore } from "@/store/mediasoupStore";
import { useCallStore } from "@/store/useCallStore";

export default function LivePageBottomNav() {
  const isMicOn = useMediaControlsStore((state) => state.isMicOn)
  const setIsMicOn = useMediaControlsStore((state) => state.setIsMicOn)
  const isVidOn = useMediaControlsStore((state) => state.isVidOn)
  const setIsVidOn = useMediaControlsStore((state) => state.setIsVidOn)

  const localStream = useMediaControlsStore((state) => state.localStream)

  const videoProducer = useMediasoupStore((state) => state.videoProducer)
  const audioProducer = useMediasoupStore((state) => state.audioProducer);

  const setRoomId = useCallStore((state) => state.setRoomId)
  const setName = useCallStore((state) => state.setName)
  const setSocketId = useCallStore((state) => state.setSocketId)

  const sendTransport = useMediasoupStore((state) => state.sendTransport)
  const recvTransport = useMediasoupStore((state) => state.recvTransport)
  const setSendTransport = useMediasoupStore((state) => state.setSendTransport)
  const setRecvTransport = useMediasoupStore((state) => state.setRecvTransport)

  function handleVideo() {
    if (!localStream) {
      console.log("Local stream does not exist");
      return;
    }
    if (!videoProducer) {
      console.warn("Video producer not ready");
      return;
    }
    setIsVidOn();
    toggleVideo(localStream);
    if (isVidOn) {
      videoProducer.pause();
    } else {
      videoProducer.resume();
    }
  }

  function handleAudio() {
    if (!localStream) {
      console.log("Local stream does not exist");
      return;
    }
    if (!audioProducer) {
      console.warn("Audio producer not ready")
      return
    }
    setIsMicOn();
    toggleAudio(localStream);
    if (isMicOn) {
      audioProducer.pause();
    } else {
      audioProducer.resume();
    }
  }

  function handleEndCall() {
    videoProducer?.close();
    audioProducer?.close();
    sendTransport?.close();
    recvTransport?.close();
    setSendTransport(undefined)
    setRecvTransport(undefined)
    localStream?.getTracks().forEach(track => track.stop())
    disconnectSocket()
    setRoomId("")
    setSocketId("")
    setName("")
  }

  return (
    <>
      <div className="bg-sidebar flex w-full items-center px-4 py-5">
        <div className="flex w-full items-center justify-center gap-4 pl-10">
          <Button
            className="cursor-pointer font-semibold"
            variant="destructive"
          >
            <Disc2 />
            Record
          </Button>
          <Button
            size="icon"
            variant={isMicOn ? "outline" : "destructive"}
            onClick={handleAudio}
            className="cursor-pointer"
          >
            {isMicOn ? <Mic /> : <MicOff />}
          </Button>
          <Button
            size="icon"
            variant={isVidOn ? "outline" : "destructive"}
            onClick={handleVideo}
            className="cursor-pointer"
          >
            {isVidOn ? <Video /> : <VideoOff />}
          </Button>
          <Button variant="outline" size="icon" className="cursor-pointer">
            <MonitorUp />
          </Button>

          <Button className="cursor-pointer"
            onClick={handleEndCall}
          >
            <Phone className="rotate-136" />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3">
          <MessageSquareText />
          <Users />
          <LayoutGrid />
        </div>
      </div>
    </>
  );
}
