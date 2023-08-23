import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
import prisma from "@/prisma"
import { NextResponse } from "next/server"

export const GET = async (req: Request, { params }: { params: { id: string } }) => {


  if (!params?.id) return
  try {
    await connectToDb()
    const user = await prisma.user.findFirst({
      where: { id: params.id },
      include: { blogs: true, _count: true }
    })

   return  genereateSucessMessage(user, 200)

  } catch (error) {

   return generateErrorMessage( error, 500)

  } finally {
    await prisma.$disconnect()
  }
}