import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
import prisma from "@/prisma"
import { NextResponse } from "next/server"

export const GET = async () => {
  try {
    await connectToDb()
    const categories = await prisma.category.findMany()

    return genereateSucessMessage(categories, 200)

  } catch (error) {

    return generateErrorMessage(error, 500)

  } finally {
    await prisma.$disconnect()
  }
}




export const POST = async (req: Request) => {

  const { name } = await req.json()

  try {
    await connectToDb()
    const category = await prisma.category.create({ data: { name } })

    return genereateSucessMessage({ category }, 200)
  } catch (error) {
    return generateErrorMessage({ error }, 500)
  } finally {
    await prisma.$disconnect()
  }
}