'use client'


import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { BlogItemTypes } from '@/lib/types'
import { toast } from 'react-hot-toast'
import BlogItem from '@/app/components/BlogItem'



const SearchPage = () => {

  const [blogs, setblogs] = useState<BlogItemTypes[]>([])

  const { handleSubmit, register } = useForm()




  const handleSearch = async ({ search }: { search: string }) => {

    let str = search



    // fucntion to  fix blank spaces on search and replace them with %20 that the server can understand 
    if (search.includes(' ')) {
      str = search.split(' ').join('%20')
    }


    toast.loading('searching', { id: 'SEARCH' })


    try {
      toast.loading('searching', { id: 'SEARCH' })
      const res = await fetch('http://localhost:3000/api/search?title=' + str, { cache: 'no-store' })
      const data = await res.json()

console.log(data.blogs)

      setblogs(data.blogs)



      toast.success('Search Completed', { id: 'SEARCH' })
    } catch (error) {
      console.log(error)
      toast.loading('Search Error', { id: 'SEARCH' })
    }



  }




  return (
    <section className='w-full h-full'>
      <h2 className="text-3xl text-center font-bold font-serif my-12">
        Search From The Amazing Blogs
      </h2>
      <div className="flex items-center justify-center  ">
        <div className=" w-2/4 flex items-center justify-between bg-gray-100 my-4 py-4  rounded-l-xl text-slate-900 font-semibold px-4 text-xl shadow ">

          <input type="text" className='bg-transparent border-none outline-none p-1 w-full' placeholder='Ex: fitness'  {...register("search", { required: true })} />


        </div>
        <div
          //@ts-ignore
          onClick={handleSubmit(handleSearch)}
          className=" w-20 flex items-center justify-between bg-slate-400  my-4 py-4 rounded-r-xl text-slate-200 font-semibold px-2 text-lg  hover:bg-purple-400 duration-500  shadow ">

          <button

            className='bg-transparent border-none outline-none p-1 w-full' placeholder='Ex: fitness' >  <FaSearch size={28} className='rounded-full cursor-pointer mx-auto' />  </button>

        </div>
      </div>

      <div className="flex w-full flex-wrap gap-4 justify-center mt-6">
        {blogs.map((blog) => <BlogItem key={blog.id} {...blog} />)}
      </div>

    </section>
  )
}

export default SearchPage