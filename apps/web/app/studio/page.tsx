"use client";

import { Button } from "@/components/ui/button";
import { RemoteVideo } from "@/components/RemoteVideo";
import useMediasoupWebrtc from "../hooks/useMediasoupWebrtc";
import useSocket from "../hooks/useSocket";

export default function Studio() {
  const { socketId, socketRef } = useSocket();

  const {
    roomId,
    setRoomId,
    myVideoRef,
    createRoom,
    joinRoom,
    remoteStreamRef,
    remoteStreams,
  } = useMediasoupWebrtc(socketId, socketRef);

  return (
    <>
      <div>
        <div>Welcome to studio</div>
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
            <input
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
          {roomId && <div>{roomId}</div>}
          {roomId && <div>{roomId}</div>}
        </div>
      </div>
    </>
  );
}
