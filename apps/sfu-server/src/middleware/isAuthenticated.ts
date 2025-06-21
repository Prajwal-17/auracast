import { auth } from "@repo/auth/auth";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session || !session.user) {
      res.status(400).json({ error: "Unauthorized" })
    }

    next();
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: "Something went wrong" })
  }
};