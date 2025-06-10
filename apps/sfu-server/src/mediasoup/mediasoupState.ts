import * as mediasoup from "mediasoup"

export type RoomStateType = {
  workerRef: string,
  router: mediasoup.types.Router,
  transports: Map<string, mediasoup.types.WebRtcTransport>,
  producers: Map<string, mediasoup.types.Producer>,
  consumers: Map<string, mediasoup.types.Consumer>,
}

export type MediasoupStateType = {
  worker: mediasoup.types.Worker | null,
  room: Map<string, RoomStateType>
}

export const mediasoupState: MediasoupStateType = {
  worker: null,
  room: new Map(),
}