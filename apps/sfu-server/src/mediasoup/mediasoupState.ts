import * as mediasoup from "mediasoup"

export type RoomStateType = {
  workerRef: string,
  router: mediasoup.types.Router,
  peers: Map<string, PeerType>
  transports: Map<string, mediasoup.types.WebRtcTransport>,
  producers: Map<string, mediasoup.types.Producer>,
  consumers: Map<string, mediasoup.types.Consumer>,
  peerConsumers: Map<string, Set<string>>,                         // <socketId, ["producerIds"]>
}

export type PeerType = {
  userId: string,
  transports: Set<string>,
  producers: Set<string>,
  consumers: Set<string>
}

export type MediasoupStateType = {
  worker: mediasoup.types.Worker | null,
  room: Map<string, RoomStateType>
}

export const mediasoupState: MediasoupStateType = {
  worker: null,
  room: new Map(),
}