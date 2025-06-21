// process.env.DEBUG = "mediasoup*"
import express, { NextFunction, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from "node:http"
import { Server } from "socket.io";
import { setupSocket } from "./socket/socket";
import { worker } from "./mediasoup/worker";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "@repo/auth/auth";
import { isAuthenticated } from "./middleware/isAuthenticated"

dotenv.config()

const app = express();

// cors for http server
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.use(cookieParser())

app.use(express.json())

app.all("/api/auth/*splat", toNodeHandler(auth))

app.use(isAuthenticated)

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("Server Healthy!")
})

app.get("/api/me", async (req: Request, res: Response) => {
  console.log(req.headers)
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.json(session);
});

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  // cors for socket.io server
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
})

setupSocket(io)
worker()

httpServer.listen(process.env.PORT || 3001, () => {
  console.log("Server Listening to port", process.env.PORT)
})