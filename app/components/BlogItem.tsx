'use client'


import { BlogItemTypes } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { ReactDOM, } from 'react'
import { AiOutlineArrowRight } from 'react-icons/ai'
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { MdLocationOn } from 'react-icons/md'
import { toast } from 'react-hot-toast'


function getTextFromHtml(html: string) {
  const elem = document.createElement('span')
  elem.innerHTML = html


  return elem.innerText
}

const BlogItem = (props: BlogItemTypes) => {



  let shortDescription = getTextFromHtml(props?.description)





  const handleDelete = async () => {
    toast.loading("Deleting Blog", { id: 'delete' })
    try {
      await props?.deleteBlog(props.id)

      toast.success("Blog Deleted Successfully  ", { id: 'delete' })
    } catch (error) {
      console.log(error)
      toast.error(" Deleting failed   ", { id: 'delete' })
    }

  }





  return (
    <div className="max-w-md mx-auto">

      <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm w-[370px] min-h-[450px] flex flex-col relative ">

        <div className='relative h-[200px] '>
          <Image src={props.imageUrl} width='200' height='200' alt='blog image' className='object-cover object-center w-full z-1  h-48 ' />

          <div className=' absolute top-0 right-0 z-2 bg-gray-200 m-2 p-1 rounded flex items-center justify-center font-semibold'> <MdLocationOn size={20} className='text-purple-600' /> {props.location}</div>
        </div>


        <div className="  px-2 flex flex-col flex-1 h-full">

          <h5 className="text-gray-900 font-bold text-2xl tracking-tight mb-2 capitalize ">{props.title}</h5>

          <p className="font-normal   text-gray-700 my-6  line-clamp-4 mb-auto">{shortDescription}</p>

          <div className='flex justify-around items-center mb-2 gap-4'>

            <Link href={`/blogs/view/${props.id}`} className=" w-full text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm p-3 text-center   ">

              <div className='flex  items-center justify-center gap-1 text-center'>
                Read more
                <AiOutlineArrowRight size={18} />
              </div>
            </Link>



            {props.isProfile && <Link href={`blogs/edit/${props.id}`} className="w-full text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm p-3 text-center 
             ">Edit</Link>
            }
          </div>



          {props.isProfile && <button
            onClick={handleDelete}
            className=' absolute top-2 left-2 text-red-500 border  bg-white opacity-80 shadow-sm rounded-full p-2 hover:opacity-100 duration-500'><RiDeleteBin6Fill size={30} /></button>}

        </div>
      </div>
    </div>
  )
}

export default BlogItem