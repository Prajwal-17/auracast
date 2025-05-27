import express, { Request, Response } from "express"
import dotenv from "dotenv"

dotenv.config()
const app = express();
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ msg: "Request received" })
})

app.listen(3000, () => {
  console.log("Listening to port 3000")
})