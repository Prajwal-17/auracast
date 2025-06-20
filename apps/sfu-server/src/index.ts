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

dotenv.config()

const app = express();

app.use(cookieParser())

// cors for http server
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.all("/", (req: Request, res: Response) => {
  console.log("req", req.method)
})

app.all("/api/auth/*splat", toNodeHandler(auth))

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {

    console.log("req", req.headers)
    console.log("Session token:", req.cookies["better-auth.session_token"])
    const sessiontoken = req.cookies["better-auth.session_token"]
    const headers = req.headers
    const transformedHeaders = fromNodeHeaders(req.headers);
    console.log("tranform", transformedHeaders)

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers)
    });

    console.log(session)

    res.status(400).json({ msg: "Success" })

    // next();
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Something went wrong" })
  }
};
app.use(isAuthenticated)


app.use(express.json())

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  // cors for socket.io server
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
})

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ msg: "Request received" })
})

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

setupSocket(io)
worker()

httpServer.listen(process.env.PORT || 3001, () => {
  console.log("Server Listening to port", process.env.PORT)
})