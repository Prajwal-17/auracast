import * as mediasoup from "mediasoup"
import { createRouter } from "./router"
import { mediasoupState } from "./mediasoupState"

export async function worker() {
  try {
    const worker = await mediasoup.createWorker(
      {
        logLevel: "debug",
        logTags: ["dtls"],
        rtcMinPort: 10000,
        rtcMaxPort: 59999,
      }
    )

    if (!worker) {
      throw new Error("Worker creation failed")
    }

    mediasoupState.worker = worker;
    createRouter()

    worker.on("died", (error) => {
      console.error("Worker died", error);
    })
  } catch (error) {
    console.error("Error occured in worker", error)
  }
}