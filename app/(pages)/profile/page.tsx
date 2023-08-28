import Image from 'next/image'
import React from 'react'
import { MdAttachEmail } from 'react-icons/md'
import UserIcon from '@/public/userIcon.png'
import { getAllBlogs, getUserById } from '@/lib/helpers'
import BlogItem from '../../components/BlogItem'
import { BlogItemTypes, UserItemType } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'



const Profile = async () => {

  const sessionData = await getServerSession(authOptions)

  const userData = await getUserById(sessionData?.user?.id)
   console.log(userData.blog)

  return (

    <section className='w-full h-full flex flex-col '>
      <div>
        <Image src={sessionData?.user.image ?? UserIcon} alt='UserProfile ' width={200} height={200} className='h-20 w-20 object-cover mx-auto my-8 rounded-full bg-gray-50 border-4 border-purple-400 ' />
      </div>
      <div className=" mx-auto my-2">
        <h1 className="text-4xl font-semibold  w-fit  rounded-md capitalize">
          {sessionData?.user.name}
        </h1>
      </div>

      <div className=" mx-auto my-2">
        <h1 className="text-xl font-semibold  flex items-center   w-fit gap-1">
          <span> <MdAttachEmail /> </span>             {sessionData?.user.email}
        </h1>
      </div>

      <div className="w-full h-full flex flex-col">
        <div className='w-2/4 mx-auto'>
          <p className='text-center font-semibold text-xl  text-gray-50 bg-gray-400 border shadow-lg w-fit mx-auto rounded-md px-2'>🌟 Blogs Count: {userData?._count?.blogs} </p>
        </div>

        <div className="flex flex-wrap justy-center p-4 my-3 gap-8">
          {userData?.blogs?.map((blog: BlogItemTypes) => <BlogItem key={blog.id} {...blog} isProfile={true} />)}
        </div>


      </div>
      {/* {JSON.stringify(userData.Blogs)} */}
    </section>
  )
}

export default Profile