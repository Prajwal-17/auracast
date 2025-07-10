"use client";

import { Button } from "@/components/ui/button";
import { RemoteVideo } from "@/components/RemoteVideo";
import { useRef, useState } from "react";
import useSocket from "@/app/hooks/useSocket";
import useMediasoupWebrtc from "@/app/hooks/useMediasoupWebrtc";
import LivePageNav from "@/components/livepage/LivePageNav";
import LivePageSidebar from "@/components/livepage/LivePageSidebar";
import LivePageBottomNav from "@/components/livepage/LivePageBottomNav";
import { Input } from "@/components/ui/input";

export default function Studio() {
  const { socketId, socketRef } = useSocket();

  const recordedChunksRef = useRef<Blob[]>([]);

  const {
    roomId,
    setRoomId,
    myVideoRef,
    createRoom,
    joinRoom,
    remoteStreamRef,
    remoteStreams,
    localStream,
  } = useMediasoupWebrtc(socketId, socketRef);

  function handleRecord() {
    if (!localStream) {
      console.log("No local stream");
      return;
    }
    console.log("recording");
    recordedChunksRef.current = [];

    let chunks: any = [];

    const recorder = new MediaRecorder(localStream, { mimeType: "video/mp4" });

    recorder.ondataavailable = (e) => {
      if (!recordedChunksRef.current) {
        return;
      }
      recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: recorder.mimeType,
      });

      console.log("blob", blob);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `recording_${new Date().toISOString()}.mp4`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    recorder.start(1000);

    setTimeout(() => {
      console.log("stop recording");
      recorder.stop();
    }, 15000);
  }

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex min-h-screen w-full flex-col">
          <LivePageNav />
          <div className="flex-1">
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
              {remoteStreams.map(({ socketId, stream }, idx) => (
                <RemoteVideo key={idx} socketId={socketId} stream={stream} />
              ))}
            </div>

            <div>
              <div>
                <Input
                  type="text"
                  value={roomId}
                  className="border-2"
                  onChange={(e) => setRoomId(e.target.value)}
                />
              </div>
              <Button onClick={() => joinRoom(roomId)}>Join Room</Button>
              <Button onClick={() => createRoom()} className="my-4">
                Create Room
              </Button>
              <Button
                onClick={handleRecord}
                type="button"
                variant="destructive"
              >
                Record
              </Button>
              {roomId && <div>{roomId}</div>}
              {roomId && <div>{roomId}</div>}
            </div>
          </div>
          <LivePageBottomNav />
        </div>

        <LivePageSidebar />
      </div>
    </>
  );
}
