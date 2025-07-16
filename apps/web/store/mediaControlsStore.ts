import { create } from "zustand"
import * as mediasoupClient from "mediasoup-client"

type MediaControlsStoreType = {
  isMicOn: boolean,
  setIsMicOn: () => void,
  isVidOn: boolean,
  setIsVidOn: () => void,
  audioProducer: mediasoupClient.types.Producer | undefined,
  setAudioProducer: (newAudioProducer: mediasoupClient.types.Producer) => void,
  videoProducer: mediasoupClient.types.Producer | undefined,
  setVideoProducer: (newVideoProducer: mediasoupClient.types.Producer) => void,

}
export const useMediaControlsStore = create<MediaControlsStoreType>((set) => ({
  isMicOn: true,
  setIsMicOn: () => set((state) => ({
    isMicOn: !state.isMicOn
  })),

  isVidOn: true,
  setIsVidOn: () => set((state) => ({
    isVidOn: !state.isVidOn
  })),

  // each user create two producer - one audio , one video
  audioProducer: undefined,
  setAudioProducer: (newAudioProducer) => set(() => ({
    audioProducer: newAudioProducer
  })),

  videoProducer: undefined,
  setVideoProducer: (newVideoProducer) => set(() => ({
    videoProducer: newVideoProducer
  })),

  // record 
  // endcall 

}))
