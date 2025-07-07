"use client";

import DashboardNav from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Lobby() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const isHost = mode === "host";
  const isJoin = mode === "join";

  if (!isHost && !isJoin) {
    console.log("Invalid params");
    return <div>Invalid Params</div>;
  }

  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isVidOn, setIsVidOn] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function getStream() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (!videoRef.current) {
        console.log("Video Ref does not exist");
        return;
      }
      videoRef.current.srcObject = stream;
    }

    getStream();
  }, [isVidOn]);

  return (
    <>
      <div className="flex h-full min-h-screen w-full flex-col justify-between">
        <DashboardNav />
        <div className="mb-32 flex w-full flex-1 items-center justify-center px-3 py-2 md:px-7">
          <div className="w-full gap-16 px-5 py-4 md:flex md:items-center md:justify-center">
            <div className="text-card-foreground space-y-5 py-5 md:px-5">
              <div className="text-xl font-bold">
                Ensure your mic and camera are working
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Input placeholder="Enter your name" className="w-full" />
                {isJoin && (
                  <Input placeholder="Enter studio id" className="w-full" />
                )}
                <Button className="w-full py-5">
                  {isHost ? "Start Studio" : "Join Studio"}
                </Button>
              </div>
              <div className="text-muted-foreground text-sm font-medium">
                You are joining as a {isHost ? "host" : "participant"}.
              </div>
            </div>
            <div className="bg-card text-card-foreground aspect-video space-y-4 rounded-lg border px-3 py-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-md border md:w-[300px] lg:w-[400px]">
                {isVidOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                    <VideoOff size={50} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-sm font-medium">
                      Camera is off
                    </span>
                  </div>
                )}
              </div>

              <div className="flex w-full items-center justify-center gap-5">
                <Button
                  size="icon"
                  variant={isMicOn ? "ghost" : "destructive"}
                  onClick={() => setIsMicOn((prev) => !prev)}
                >
                  {isMicOn ? <Mic /> : <MicOff />}
                </Button>
                <Button
                  size="icon"
                  variant={isVidOn ? "ghost" : "destructive"}
                  onClick={() => setIsVidOn((prev) => !prev)}
                >
                  {isVidOn ? <Video /> : <VideoOff />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
