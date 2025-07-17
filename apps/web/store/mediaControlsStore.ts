// store/mediaControlsStore.ts

import { create } from 'zustand';

export type MediaControlsStoreType = {
  isMicOn: boolean;
  setIsMicOn: () => void;
  isVidOn: boolean;
  setIsVidOn: () => void;
  localStream?: MediaStream;
  setLocalStream: (stream: MediaStream) => void;
};

export const useMediaControlsStore = create<MediaControlsStoreType>((set) => ({
  isMicOn: true,
  setIsMicOn: () => set((state) => ({ isMicOn: !state.isMicOn })),
  isVidOn: true,
  setIsVidOn: () => set((state) => ({ isVidOn: !state.isVidOn })),
  localStream: undefined,
  setLocalStream: (stream) => set(() => ({ localStream: stream })),
}));

