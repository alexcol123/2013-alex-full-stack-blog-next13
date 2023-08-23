import prisma from "@/prisma"


export const connectToDb = async () => {
  try {
    await prisma.$connect()
  } catch (err: any) {
    throw new Error(err)
  }
}