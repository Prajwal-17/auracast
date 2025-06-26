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
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Cleanup previous stream
    const previousStream = videoElement.srcObject as MediaStream;
    if (previousStream) {
      previousStream.getTracks().forEach((track) => {
        // Don't stop the track, just remove from this video element
        if (stream.getTracks().includes(track)) return;
        track.stop();
      });
    }

    // Set new stream
    videoElement.srcObject = stream;

    // Handle track additions/removals
    const handleTrackAdd = (event: MediaStreamTrackEvent) => {
      console.log("Track added:", event.track.kind);
    };

    const handleTrackRemove = (event: MediaStreamTrackEvent) => {
      console.log("Track removed:", event.track.kind);
    };

    stream.addEventListener("addtrack", handleTrackAdd);
    stream.addEventListener("removetrack", handleTrackRemove);

    return () => {
      stream.removeEventListener("addtrack", handleTrackAdd);
      stream.removeEventListener("removetrack", handleTrackRemove);
      // Don't stop tracks here - let the parent component manage that
    };
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
          backgroundColor: "black", // Helps identify empty video
        }}
      />
      <div className="m-4 inline-block rounded-lg bg-black p-3 text-white">
        User: {socketId}
      </div>
    </div>
  );
};
