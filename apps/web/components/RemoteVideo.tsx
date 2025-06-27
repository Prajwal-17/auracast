"use client";
import { useEffect, useRef } from "react";

export const RemoteVideo = ({
  socketId,
  stream,
}: {
  socketId: string;
  stream: MediaStream;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    } else {
      console.log("no ref");
    }
  }, [stream]);

  return (
    <div key={socketId} className="remote-video-container">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{
          width: "300px",
          margin: "5px",
          height: "auto",
          transform: "scaleX(-1)",
          display: "block",
          backgroundColor: "black",
        }}
      />
      <div className="m-4 inline-block rounded-lg bg-black p-3 text-white">
        User: {socketId}
      </div>
    </div>
  );
};
