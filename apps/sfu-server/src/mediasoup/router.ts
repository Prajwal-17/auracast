import * as mediasoup from "mediasoup"
import { mediasoupState } from "./mediasoupState"
import { v4 as uuid } from "uuid"

export async function createRouter() {
  const worker = mediasoupState.worker;

  const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
    {
      kind: "video",
      mimeType: "video/H264",
      clockRate: 90000,
      parameters: {
        "packetization-mode": 1,
        "profile-level-id": "42e01f",
        "level-asymmetry-allowed": 1
      },
      rtcpFeedback: [
        { type: "nack" },
        { type: "nack", parameter: "pli" },
        { type: "ccm", parameter: "fir" },
        { type: "goog-remb" }
      ]
    },
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
      parameters: {
        useinbandfec: 1,
        usedtx: 1
      },
      rtcpFeedback: []
    }
  ]

  try {
    const router = await worker?.createRouter({ mediaCodecs })

    if (!router) {
      throw new Error("Router creation failed")
    }

    const routerId = `router_${uuid()}`;
    mediasoupState.router.set(routerId, router)

  } catch (error) {
    console.error("Error occured in router", error)
  }
}