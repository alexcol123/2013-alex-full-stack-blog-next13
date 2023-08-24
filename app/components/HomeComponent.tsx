// import { getAllBlogs } from "@/lib/helpers"
import { getAllBlogs } from "@/lib/helpers"
import Image from "next/image"
import BlogItem from "./BlogItem"
import { BlogItemTypes } from "@/lib/types"
// import BlogItem from "./BlogItem"
// import { BlogItemTypes } from "@/lib/types"

const HomeSection = async () => {

  const blogs = await getAllBlogs(6)

  return (


    <section className="w-full my-4" >
      <div className="w-full flex xs:flex-col md:flex-row justify-center items-center">
        <div className="p-8 w-3/4 flex flex-col gap-3">
          <p className="tracking-wide lg:text-6xl md:text-3xl  xs:text-2xl font-semibold md:w-2/4  sx:4/4 text-start text-gray-700">
            Learn from the best, and become the best version of you.
          </p>
          <p className="tracking-wider my-2 md:text-2xl xs:text-md font-semibold md:3/4 xs:w-full text-start text-gray-900">
            Learn by doing, for FREE with pracitcal step by step Series and Articles
          </p>
        </div>
        <div className="md:w-2/4 xs:w-3/4 md:mx-2 xs:my-2">
          <Image className="w-full rounded-2xl drop-shadow-2xl " alt="CarouserImage" width={300} height={200}
            src={'https://images.unsplash.com/photo-1522071901873-411886a10004'}
          />
        </div>
      </div>
      <hr className="w-full p-3 my-8" />
      <div className="p-3 my-4">
        <div className="flex flex-col justify-center items-center">
          <div className="p-4">
            <h2 className="text-2xl font-semibold">Recent Articles</h2>

          </div>
          <div className="flex w-full flex-wrap justify-center gap-6">

            {blogs?.map((blog: BlogItemTypes) => (
              <BlogItem key={blog.id} {...blog} />
            ))}



          </div>

          <div className="w-full flex flex-col items-center p-4 ">
            <button className="mt-8 border-violet-600  text-center text-violet-600 border p-3 rounded-lg px-20 hover:bg-violet-600 hover:text-violet-100 duration-500 font-semibold ">View more articles</button>
          </div>


        </div>
      </div>
    </section>
  )
}

export default HomeSection