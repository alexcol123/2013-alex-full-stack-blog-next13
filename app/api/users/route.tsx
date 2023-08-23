import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
import prisma from "@/prisma"
import { NextResponse } from "next/server"

export const GET = async () => {
  try {
    await connectToDb()
    const users = await prisma.user.findMany()


    return genereateSucessMessage(users, 200)
  } catch (error) {
    return generateErrorMessage(error, 500)

  } finally {
    await prisma.$disconnect()
  }
}