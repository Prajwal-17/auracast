import { create } from "zustand"

type CallStoreType = {
  roomId: string,
  setRoomId: (newRoomId: string) => void
  socketId: string,
  setSocketId: (newSocketId: string) => void
  name: string,
  setName: (newName: string) => void
}

export const useCallStore = create<CallStoreType>((set) => ({
  roomId: "",
  setRoomId: (newRoomId) => set(() => ({
    roomId: newRoomId
  })),

  socketId: "",
  setSocketId: (newSocketId) => set(() => ({
    socketId: newSocketId
  })),

  name: "",
  setName: (newName) => set(() => ({
    name: newName
  })),

}))
