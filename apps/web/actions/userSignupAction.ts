"use server"

import prisma from "@/lib/db"
import bcrypt from "bcryptjs";

export async function userSignupAction(name: string, email: string, password: string) {
  try {

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    });

    if (existingUser) {
      console.log("User already exists")
      return "User already exits"
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword
      }
    });

    if (!newUser) {
      console.log("Error occured while creating user")
      return "Error occured while creating user"
    }

    return "User created successfully"
  } catch (error) {
    console.log(error)
  }
}