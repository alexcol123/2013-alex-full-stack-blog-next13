import prisma from "@/prisma"
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
  const res = await fetch('http://localhost:3000/api/blogs', { next: { revalidate: 5 } });
  const data = await res.json()


  if (count) {
    return data.blogs.slice(0, count)
  }
  return data.blogs
}


export const getAllCategories = async () => {
  const res = await fetch('http://localhost:3000/api/categories/');
  const data = await res.json()

  console.log('getall cate')


  return data.categories
}