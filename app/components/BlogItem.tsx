'use client'


import { BlogItemTypes } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { ReactDOM, } from 'react'
import { AiOutlineArrowRight } from 'react-icons/ai'




function getTextFromHtml(html: string) {
  const elem = document.createElement('span')
  elem.innerHTML = html


  return elem.innerText
}

const BlogItem = (props: BlogItemTypes) => {

let shortDescription = getTextFromHtml(props?.description)







  return (
    <div className="max-w-md mx-auto">

      <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm ">

        <Image src={props.imageUrl} width='200' height='200' alt='blog image' className='object-cover w-full' />

        <div className="p-5">

          <h5 className="text-gray-900 font-bold text-2xl tracking-tight mb-2 capitalize ">{props.title}</h5>

          <p className="font-normal text-gray-700 my-6 dark:text-gray-400 line-clamp-4">{shortDescription}</p>
          <Link href={`/blogs/${props.id}`} className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center ">

            <div className='flex justify-center items-center gap-2'>
              Read more
              <AiOutlineArrowRight size={18} />
            </div>
          </Link>
        </div>
      </div>


    </div>
  )
}

export default BlogItem