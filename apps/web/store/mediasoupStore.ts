import { create } from "zustand"
import * as mediasoupClient from "mediasoup-client"

type MediasoupStoreType = {
  audioProducer: mediasoupClient.types.Producer | undefined,
  setAudioProducer: (newAudioProducer: mediasoupClient.types.Producer | undefined) => void,
  videoProducer: mediasoupClient.types.Producer | undefined,
  setVideoProducer: (newVideoProducer: mediasoupClient.types.Producer | undefined) => void,
  sendTransport: mediasoupClient.types.Transport | undefined,
  setSendTransport: (newSendTransport: mediasoupClient.types.Transport | undefined) => void,
  recvTransport: mediasoupClient.types.Transport | undefined,
  setRecvTransport: (newSendTransport: mediasoupClient.types.Transport | undefined) => void,
}

export const useMediasoupStore = create<MediasoupStoreType>((set) => ({
  // each user create two producer - one audio , one video
  audioProducer: undefined,
  setAudioProducer: (newAudioProducer) => set(() => ({
    audioProducer: newAudioProducer
  })),

  videoProducer: undefined,
  setVideoProducer: (newVideoProducer) => set(() => ({
    videoProducer: newVideoProducer
  })),

  sendTransport: undefined,
  setSendTransport: (newSendTransport) => set(() => ({
    sendTransport: newSendTransport
  })),

  recvTransport: undefined,
  setRecvTransport: (setRecvTransport) => set(() => ({
    recvTransport: setRecvTransport
  })),
}))
