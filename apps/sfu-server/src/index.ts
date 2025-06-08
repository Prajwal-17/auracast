// process.env.DEBUG = "mediasoup*"
import express, { Request, Response } from "express"
import dotenv from "dotenv"
import { createServer } from "node:http"
import { Server } from "socket.io";
import { setupSocket } from "./socket/socket";
import { worker } from "./mediasoup/worker";

dotenv.config()

const app = express();
app.use(express.json())

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"]
  }
})

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ msg: "Request received" })
})

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("Server Healthy!")
})

setupSocket(io)
worker()

httpServer.listen(process.env.PORT || 3001, () => {
  console.log("Server Listening to port", process.env.PORT)
})