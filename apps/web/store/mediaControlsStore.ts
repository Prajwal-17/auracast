import { create } from "zustand"

type MediaControlsStoreType = {
  isMicOn: boolean,
  setIsMicOn: () => void,
  isVidOn: boolean,
  setIsVidOn: () => void,
  localStream: MediaStream | undefined,
  setLocalStream: (newStream: MediaStream) => void
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

  localStream: undefined,
  setLocalStream: (newStream) => set(() => ({
    localStream: newStream
  }))

  // record 
  // endcall 

}))
