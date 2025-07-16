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
import { useEffect } from "react";
import { Button } from "../ui/button";
import { useCallStore } from "@/store/useCallStore";
import { toggleAudio, toggleVideo } from "@/lib/videoUtils";
import { useMediaControlsStore } from "@/store/mediaControlsStore";

export default function LivePageBottomNav() {
  const isMicOn = useMediaControlsStore((state) => state.isMicOn)
  const setIsMicOn = useMediaControlsStore((state) => state.setIsMicOn)
  const isVidOn = useMediaControlsStore((state) => state.isVidOn)
  const setIsVidOn = useMediaControlsStore((state) => state.setIsVidOn)

  const localStream = useCallStore((state) => state.localStream)

  const videoProducer = useMediaControlsStore((state) => state.videoProducer)
  const audioProducer = useMediaControlsStore((state) => state.audioProducer);

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

  async function handleAudio() {
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

          <Button className="cursor-pointer">
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
