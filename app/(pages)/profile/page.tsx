'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { MdAttachEmail } from 'react-icons/md'
import UserIcon from '@/public/userIcon.png'

import BlogItem from '../../components/BlogItem'
import { BlogItemTypes, UserItemType } from '@/lib/types'

import { authOptions } from '../../api/auth/[...nextauth]/route'
import { useSession } from 'next-auth/react'





const Profile = () => {

  const [currentUserData, setCurrentUserData] = useState<UserItemType | null>(null)





  const { data: session } = useSession()
  // console.log(session.user)

  // const sessionData = await getServerSession(authOptions)

  // const userData = await getUserById(sessionData?.user?.id)
  // console.log(userData.blog)



  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deleteBlog = (async (id: string) => {
    const res = await fetch('http://localhost:3000/api/blogs/' + id, {
      cache: 'no-store',
      method: "DELETE",
    },
    );
    const data = await res.json()

    console.log(data)
    return data.blog
  }
  )

  const getUserDataById = async (id: string) => {

    const res = await fetch('http://localhost:3000/api/users/' + id,
      { cache: 'no-store' }
      // { next: { revalidate: 0 } }
    );

    const data = await res.json()

    setCurrentUserData(data)
  }


  console.log(currentUserData)

  useEffect(() => {
    if (session && session.user) {
      getUserDataById(session.user.id)

    }
  }, [session, deleteBlog])


  return (

    <section className='w-full h-full flex flex-col '>
      <div>
        <Image src={session?.user.image ?? UserIcon} alt='UserProfile ' width={200} height={200} className='h-20 w-20 object-cover mx-auto my-8 rounded-full bg-gray-50 border-4 border-purple-400 ' />
      </div>
      <div className=" mx-auto my-2">
        <h1 className="text-4xl font-semibold  w-fit  rounded-md capitalize">
          {session?.user.name}
        </h1>
      </div>

      <div className=" mx-auto my-2">
        <h1 className="text-xl font-semibold  flex items-center   w-fit gap-1">
          <span> <MdAttachEmail /> </span>             {session?.user.email}
        </h1>
      </div>

      {currentUserData &&
        <div className="w-full h-full flex flex-col">
          <div className='w-2/4 mx-auto'>
            <p className='text-center font-semibold text-xl  text-gray-50 bg-gray-400 border shadow-lg w-fit mx-auto rounded-md px-2'>🌟 Blogs Count: {currentUserData?._count?.blogs} </p>

          </div>

          <div className=" flex flex-wrap justy-center p-4 my-3 gap-8">

            {currentUserData?.blogs?.map((blog: BlogItemTypes) => <BlogItem key={blog.id} {...blog} isProfile={true} deleteBlog={deleteBlog} />)}

          </div>

        </div>

      }


      {/* {JSON.stringify(userData.Blogs)} */}
    </section >
  )
}

export default Profile