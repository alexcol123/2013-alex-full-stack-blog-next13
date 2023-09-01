import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
import prisma from "@/prisma"

export const GET = async (req: Request) => {

  const searchTitle = new URL(req.url).searchParams.get('title')



  try {
    await connectToDb()
    const blogs = await prisma.blog.findMany({
      where:
      {
        title: {
          contains: searchTitle ?? '',
          mode: 'insensitive'
        }
      }
    })





    return genereateSucessMessage({ blogs }, 200)
  } catch (error) {
    return generateErrorMessage({ error }, 500)
  } finally {
    await prisma.$disconnect()
  }
}
