import { toggleAudio, toggleVideo } from "@/lib/videoUtils";
import { useMediaControlsStore } from "@/store/mediaControlsStore";
import { disconnectSocket } from "@/lib/socket/socket";
import { useMediasoupStore } from "@/store/mediasoupStore";
import { useCallStore } from "@/store/useCallStore";
import { useShallow } from "zustand/shallow"

export default function useMediaControls() {
  const {
    isMicOn,
    setIsMicOn,
    isVidOn,
    setIsVidOn,
    localStream,
  } = useMediaControlsStore(
    useShallow(
      (state) => ({
        isMicOn: state.isMicOn,
        setIsMicOn: state.setIsMicOn,
        isVidOn: state.isVidOn,
        setIsVidOn: state.setIsVidOn,
        localStream: state.localStream,
      })
    )
  );

  const {
    videoProducer,
    audioProducer,
    sendTransport,
    recvTransport,
    setRecvTransport,
    setSendTransport
  } = useMediasoupStore(useShallow(
    (state) => ({
      videoProducer: state.videoProducer,
      audioProducer: state.audioProducer,
      sendTransport: state.sendTransport,
      recvTransport: state.recvTransport,
      setRecvTransport: state.setRecvTransport,
      setSendTransport: state.setSendTransport
    })
  ))

  const setRoomId = useCallStore((state) => state.setRoomId)
  const setName = useCallStore((state) => state.setName)
  const setSocketId = useCallStore((state) => state.setSocketId)

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

  return {
    isMicOn,
    isVidOn,
    handleAudio,
    handleVideo,
    handleEndCall,
  }
}
