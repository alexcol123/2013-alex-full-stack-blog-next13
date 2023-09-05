import prisma from "@/prisma"
import { DefaultUser } from "next-auth";
import { NextResponse } from "next/server";

export const connectToDb = async () => {
  try {
    await prisma.$connect()
  } catch (err: any) {
    throw new Error(err)
  }
}



export const genereateSucessMessage = (data: any, status: number) => {
  return NextResponse.json({ message: 'success', ...data }, { status, statusText: 'OK' })
}

export const generateErrorMessage = (data: any, status: number) => {
  return NextResponse.json({ message: 'Error', ...data }, { status, statusText: 'ERROR' })
}


export const getAllBlogs = async (count?: number) => {
  const res = await fetch('http://localhost:3000/api/blogs',
    // { cache: 'no-store' }
    { next: { revalidate: 0 } }
  );
  const data = await res.json()


  if (count) {
    return data.blogs.slice(0, count)
  }
  return data.blogs
}

export const getBlogById = async (id: string) => {
  const res = await fetch(`http://localhost:3000/api/blogs/${id}`,
    // { cache: 'no-cache' }
    { next: { revalidate: 2 } }

  )
  const data = await res.json()

  return data.blog
}


export const getAllCategories = async () => {
  const res = await fetch('http://localhost:3000/api/categories/');
  const data = await res.json()


  return data.categories
}

export const getUserById = async (id: string) => {

  console.log('id  user ', id)
  const res = await fetch('http://localhost:3000/api/users/' + id, 
  // { cache: 'no-store' }
  { next: { revalidate: 0 } }
  );

  const data = await res.json()

  return data
}



export const verifyUsrDetailsAtLogin = async (user: DefaultUser) => {
  await connectToDb();

  const userExistsInDB = await prisma.user.findFirst({ where: { email: user.email as string } })

  if (userExistsInDB) return userExistsInDB

  else {
    const newUser = await prisma.user.create({ data: { email: user.email as string, name: user.name as string } })

    return newUser

  }
}