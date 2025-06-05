export type RouterObjectsType = {
  id: string,
  socketId: string,
  type: RouterType,
  mediaType: string
}

export enum RouterType {
  SEND_TRANSPORT = "send_transport",
  RECV_TRANSPORT = "recv_transport",
  PRODUCER = "producer",
  CONSUMER = "consumer"
}

export type MediasoupStoreType = {
  roomId: string,
  setRoomId: (newRoomId: string) => void,
  socketId: string,
  setSocketId: (newSocketId: string) => void,
  transports: RouterObjectsType[],
  setTransports: () => void,
  producers: RouterObjectsType[],
  setProducers: () => void,
  consumers: RouterObjectsType[],
  setConsumers: () => void
}