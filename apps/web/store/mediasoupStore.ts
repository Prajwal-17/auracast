import { MediasoupStoreType } from "@/app/types";
import { create } from "zustand";

export const useMediasoupStore = create<MediasoupStoreType>((set) => ({

  roomId: "",
  setRoomId: (newRoomId) => set(() => ({
    roomId: newRoomId
  })),

  socketId: "",
  setSocketId: (newSocketId) => set(() => ({
    socketId: newSocketId
  })),

  transports: [],
  setTransports: () => { },

  producers: [],
  setProducers: () => { },

  consumers: [],
  setConsumers: () => { }
}))