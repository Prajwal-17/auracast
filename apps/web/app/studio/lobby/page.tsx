"use client";

import DashboardNav from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleAudio, toggleVideo } from "@/lib/videoUtils";
import { useCallStore } from "@/store/useCallStore";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ShortUniqueId from "short-unique-id";
import { toast } from "sonner";

export default function Lobby() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const router = useRouter();

  const isHost = mode === "host";
  const isJoin = mode === "join";

  if (!isHost && !isJoin) {
    console.log("Invalid params");
    return <div>Invalid Params</div>;
  }

  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVidOn, setIsVidOn] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  const roomId = useCallStore((state) => state.roomId);
  const setRoomId = useCallStore((state) => state.setRoomId);
  const name = useCallStore((state) => state.name);
  const setName = useCallStore((state) => state.setName);
  const localStream = useCallStore((state) => state.localStream);
  const setLocalStream = useCallStore((state) => state.setLocalStream);

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
      setLocalStream(stream);
      videoRef.current.srcObject = stream;
    }

    getStream();
  }, [isVidOn]);

  function handleVideo() {
    if (!localStream) {
      console.log("Local stream does not exist");
      return;
    }
    toggleVideo(localStream);
    setIsVidOn((prev) => !prev);
  }

  function handleAudio() {
    if (!localStream) {
      console.log("Local stream does not exist");
      return;
    }
    toggleAudio(localStream);
    setIsMicOn((prev) => !prev);
  }

  function handleStartStudio() {
    setLoading(true);
    if (!name) {
      toast.error("Name is missing");
      setLoading(false);
      return;
    }
    const uniqueId = new ShortUniqueId({
      length: 6,
      dictionary: "alphanum_upper",
    });
    const newRoomId = uniqueId.rnd();
    setRoomId(newRoomId);
    if (!newRoomId) {
      toast.error("Error creating room");
      setLoading(false);
      return;
    }
    router.push(`/studio/live/${newRoomId}`);
    setLoading(false);
  }

  function handleJoinStudio() {
    setLoading(true);
    if (!name || !roomId) {
      toast.error("Fields are missing");
      setLoading(false);
      return;
    }
    router.push(`/studio/live/${roomId}`);
    setLoading(false);
  }

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
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                />
                {isJoin && (
                  <Input
                    required
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter studio id"
                    className="w-full"
                  />
                )}
                {isHost ? (
                  <Button
                    variant="default"
                    size="default"
                    disabled={loading}
                    onClick={handleStartStudio}
                    className="w-full py-5 font-semibold hover:cursor-pointer"
                  >
                    {loading ? "Starting Studio..." : "Start Studio"}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="default"
                    disabled={loading}
                    onClick={handleJoinStudio}
                    className="w-full py-5 font-semibold hover:cursor-pointer"
                  >
                    {loading ? "Joining Studio..." : "Join Studio"}
                  </Button>
                )}
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
                  onClick={handleAudio}
                >
                  {isMicOn ? <Mic /> : <MicOff />}
                </Button>
                <Button
                  size="icon"
                  variant={isVidOn ? "ghost" : "destructive"}
                  onClick={handleVideo}
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
