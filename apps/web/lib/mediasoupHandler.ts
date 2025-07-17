import { mediasoupHandlerType } from "@/types";
import * as mediasoupClient from "mediasoup-client";

export const mediasoupHandler = async ({
  socket,
  socketId,
  roomId,
  remoteStreamRef,
  remoteStreams,
  setRemoteStreams,
  myVideoRef,
  localStream,
  setAudioProducer,
  setVideoProducer,
  sendTransport,
  recvTransport,
  setSendTransport,
  setRecvTransport
}: mediasoupHandlerType) => {
  let device: mediasoupClient.types.Device;

  try {
    if (!socket) {
      console.warn("Socket not initialized yet");
      return;
    }

    const rtpCapabilities = await socket
      .timeout(15000)
      .emitWithAck("getRtpCapabilities", roomId);

    // check rtp cap
    device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });

    const sendTransportOptions = await socket
      .timeout(15000)
      .emitWithAck("createSendTransport", roomId);

    // check for send transport

    sendTransport = device.createSendTransport({
      ...sendTransportOptions,
      iceServers: [
        {
          urls:
            process.env.NEXT_PUBLIC_STUN_SERVER_URL ||
            "stun:stun.l.google.com:19302",
        },
      ],
    });
    setSendTransport(sendTransport)

    const sendTransportId = sendTransport.id;
    sendTransport.on("connect", async ({ dtlsParameters }, callback) => {
      try {
        await socket.timeout(15000).emitWithAck("send-transport-connect", {
          roomId,
          sendTransportId,
          dtlsParameters,
        });

        // error check
        callback();
      } catch (error) {
        console.log(error);
      }
    });

    const recvTransportOptions = await socket
      .timeout(15000)
      .emitWithAck("createRecvTransport", roomId);

    recvTransport = device.createRecvTransport({
      ...recvTransportOptions,
      iceServers: [
        {
          urls:
            process.env.NEXT_PUBLIC_STUN_SERVER_URL ||
            "stun:stun.l.google.com:19302",
        },
      ],
    });
    setRecvTransport(recvTransport)

    const recvTransportId = recvTransport.id;
    recvTransport.on("connect", async ({ dtlsParameters }, callback) => {
      try {
        await socket.timeout(15000).emitWithAck("recv-transport-connect", {
          roomId,
          recvTransportId,
          dtlsParameters,
        });

        callback();
      } catch (error) {
        console.log("Error occured in recvTransport connection", error);
      }
    });

    sendTransport.on(
      "produce",
      async ({ kind, rtpParameters }, mediasoupCallback) => {
        try {
          const producerId = await socket
            .timeout(15000)
            .emitWithAck("transport-produce", {
              roomId,
              sendTransportId,
              kind,
              rtpParameters,
            });

          mediasoupCallback(producerId);
        } catch (error) {
          console.log(error);
        }
      },
    );

    if (myVideoRef.current) {
      myVideoRef.current.srcObject = localStream;
    }
    const videoTrack = localStream.getVideoTracks()[0];
    const audioTrack = localStream.getAudioTracks()[0];
    const videoProducer = await sendTransport.produce({ track: videoTrack });
    const audioProducer = await sendTransport.produce({ track: audioTrack });
    setAudioProducer(audioProducer)
    setVideoProducer(videoProducer)

    socket.on("new-producer", async ({ producerId, producerSocketId }) => {
      try {
        if (socketId === producerSocketId) {
          return;
        }

        await consume({ producerId, producerSocketId });
      } catch (error) {
        console.log("Error occured in consume", error);
      }
    });

    const { allProducers } = await socket
      .timeout(15000)
      .emitWithAck("getAllProducers", {
        roomId,
        socketId,
      });

    if (allProducers.length <= 0) {
      return;
    }

    for (const producerObj of allProducers) {
      await consume(producerObj);
    }

    async function consume(producerObj: {
      producerId: string;
      producerSocketId: string;
    }) {
      try {
        const consumerData = await socket
          ?.timeout(15000)
          .emitWithAck("transport-consume", {
            roomId,
            recvTransportId,
            producerId: producerObj.producerId,
            rtpCapabilities: device.rtpCapabilities,
          });

        const consumer = await recvTransport.consume({
          id: consumerData.id,
          producerId: consumerData.producerId,
          kind: consumerData.kind,
          rtpParameters: consumerData.rtpParameters,
        });

        // check for consumer

        const resumeResponse = await socket
          ?.timeout(15000)
          .emitWithAck("consumer-resume", {
            roomId: roomId,
            consumerId: consumer.id,
          });

        if (resumeResponse.success) {
          consumer.resume();
        }

        let stream = remoteStreamRef.current.get(
          producerObj.producerSocketId,
        );

        if (!stream) {
          stream = new MediaStream();
          remoteStreamRef.current.set(producerObj.producerSocketId, stream);
        }

        const existingTracks = stream
          .getTracks()
          .find((t) => t.id === consumer.track.id);

        if (!existingTracks) {
          stream.addTrack(consumer.track);
        }

        setRemoteStreams((prev) => {
          const existing = prev.find(
            (item) => item.socketId === producerObj.producerSocketId,
          );

          if (existing) {
            return [...prev];
          } else {
            return [
              ...prev,
              { socketId: producerObj.producerSocketId, stream: stream },
            ];
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.error("Webrtc init failed", error);
  }
}
