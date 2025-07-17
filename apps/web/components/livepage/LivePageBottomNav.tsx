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
import useMediaControls from "@/hooks/useMediaControls";

export default function LivePageBottomNav() {
  const {
    isMicOn,
    isVidOn,
    handleAudio,
    handleVideo,
    handleEndCall
  } = useMediaControls()

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
