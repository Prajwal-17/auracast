import { Socket } from "socket.io";
import { getConsumer } from "../../../mediasoup/utils";

export default function consumerResumeHandler(socket: Socket) {
  socket.on("consumer-resume", async ({ roomId, consumerId }, callback) => {
    const consumer = getConsumer(roomId, consumerId);
    if (consumer) {
      await consumer.resume();
    }
    callback({ success: true })
  })
}