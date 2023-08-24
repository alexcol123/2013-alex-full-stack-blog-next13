import {
  getAllBlogs, getAllCategories,

} from '@/lib/helpers'

import React from 'react'
import { FaSearch } from 'react-icons/fa'

import { number } from 'prop-types'
import { BlogItemTypes } from '@/lib/types'
import BlogItem from '@/app/components/BlogItem'


type CategoryType = {
  id: String,
  name: String
}


const BlogsPage = async () => {

  const blogs = await getAllBlogs(20)

  const categories = await getAllCategories()




  return (

    <section className='w-full h-full  my-20'>
      <div className="flex flex-col gap-3 py-10 p-8">
        <h4 className="text-3xl font-semibold">
          Explore Articles on Various Categories
        </h4>
        <p className="text-xl font-semibold ">
          Practical Articles For Learning Anithing
        </p>
      </div>

      <nav className="bg-gray-100 border w-full flex mt-4 sticky top-0 bg-center gap-4 h-20 md:p-8 xs:p-2 justify-between items-center">

        <div className="mr-auto  flex w-2/4 md:w-1/4  items-center gap-6  ">
          <p className="font-semibold text-2xl">Filter</p>
          <select name="category" id="select" className='md:px-5 xs:px-2 w-3/4 mx-2 py-3 rounded-lg' >
            {categories?.map((item: { id: string, name: string }) => (
              <option key={item.id} className='rounded-md bg-gray-100' value={item.id} > {item.name}</option>
            ))}
          </select>
        </div>

        <div className="w-2/4 flex ml-auto md:gap-6 xs:gap-2 items-center">
          <p className="font-semibold text-2xl">Search </p>
          <input type="text" className="w-3/4 px-4 py-2 rounded-lg" placeholder='ex: Arts' />
          <FaSearch className='cursor-pointer' />
        </div>
      </nav>

      <div className="flex w-full flex-wrap gap-4 justify-center mt-6">

        {blogs?.map((blog: BlogItemTypes) => (
          <BlogItem key={blog.id} {...blog} />
        ))}

      </div>
    </section>
  )
}

export default BlogsPage