import * as mediasoup from "mediasoup"

export type MediasoupStateType = {
  worker: mediasoup.types.Worker | null,
  router: Map<string, mediasoup.types.Router>,
  transports: Map<string, mediasoup.types.WebRtcTransport>,
  producers: Map<string, mediasoup.types.Producer>,
  consumers: Map<string, mediasoup.types.Consumer>,
}
export const mediasoupState: MediasoupStateType = {
  worker: null,
  router: new Map(),  // -> <roomId, router>
  transports: new Map(), // -> <uuid, transport>
  producers: new Map(),  // -> <uuid, producer>
  consumers: new Map()  // -> <uuid, consumer>
}