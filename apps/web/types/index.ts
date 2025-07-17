import { RefObject } from "react";
import { Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client"

export type RouterObjectsType = {
  id: string,
  socketId: string,
  type: RouterType,
  // mediaType: string
}

export enum RouterType {
  SEND_TRANSPORT = "send_transport",
  RECV_TRANSPORT = "recv_transport",
  PRODUCER = "producer",
  CONSUMER = "consumer"
}

export type RemoteStreamsType = {
  socketId: string,
  stream: MediaStream
}

export type mediasoupHandlerType = {
  socket: Socket,
  socketId: string,
  roomId: string,
  remoteStreamRef: RefObject<Map<string, MediaStream>>,
  remoteStreams: RemoteStreamsType[],
  setRemoteStreams: React.Dispatch<React.SetStateAction<RemoteStreamsType[]>>; // react state type -> https://stackoverflow.com/a/65824149
  myVideoRef: RefObject<HTMLVideoElement | null>,
  localStream: MediaStream,
  setAudioProducer: (newAudioProducer: mediasoupClient.types.Producer) => void,
  setVideoProducer: (newVideoProducer: mediasoupClient.types.Producer) => void,
  sendTransport: mediasoupClient.types.Transport | undefined,
  setSendTransport: (newSendTransport: mediasoupClient.types.Transport) => void,
  recvTransport: mediasoupClient.types.Transport | undefined,
  setRecvTransport: (newSendTransport: mediasoupClient.types.Transport) => void,
}
