import { getBlogById } from '@/lib/helpers'
import Image from 'next/image'
import React from 'react'

const BlogViewPage = async ({ params }: { params: { id: string } }) => {

  const blog = await getBlogById(params.id)

  // console.log(blog)
  return (

    <section  className='w-full h-full flex flex-col mt-8 mb-20 '>


      <Image src={blog.imageUrl} alt={blog.title} height={400} width={400} className='md:w-2/4 xs:w-3/4 mx-auto shadow-xl rounded-lg' />

      <div className='md:w-2/4 xs:w-3/4 mx-auto  rounded-lg '>
        <h2 className='text-xl md:text-4xl   my-8 font-bold  text-center'  >{blog.title}</h2>
      </div>

      {/* html */}
      <section id='blogHtml' className='md:w-2/4 xs:w-3/4 mx-auto bg-slate-50 p-4'
        dangerouslySetInnerHTML={{ __html: blog.description }}
      ></section>

    </section>
  )
}

export default BlogViewPage