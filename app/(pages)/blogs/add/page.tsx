'use client'

import { useSession } from "next-auth/react"
import { ChangeEvent, useState, useRef, useEffect } from "react"
import Image from "next/image"

import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { useForm } from "react-hook-form"
import { EditorState, convertToRaw } from "draft-js"
import draftToHtml from 'draftjs-to-html'
import { toast } from "react-hot-toast"
// import { getAllCategories } from "@/lib/helpers"



const getBlogById = async (id: string) => {
  const res = await fetch('http://localhost:3000/api/blogs/' + id, { cache: 'no-store' });
  const data = await res.json()

  console.log(data)
  return data.blog
}


export const getAllCategories = async () => {
  const res = await fetch('http://localhost:3000/api/categories/');
  const data = await res.json()

  return data.categories
}


const BlogAdd = () => {

  // const catList1 = getAllCategories()
  // console.log("CATLIST1", catList1)
  const [categories, setcategories] = useState([])
  // const [categoriesInFunc, setcategoriesInFunc] = useState([])

  // console.log(categoriesInFunc)

  // const getBlogCat = async () => {
  //   try {
  //     const catlist3 = await getAllCategories()
  //     setcategoriesInFunc(catlist3)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // getBlogCat()


  const { data: session } = useSession()
  console.log(session)



  // console.log(categories)

  const [imageUrl, setimageUrl] = useState('')

  const [editorState, setEditorState] = useState(EditorState.createEmpty())

  const [imageFile, setimageFile] = useState<File | null>(null)

  const headingRef = useRef<HTMLHeadElement | null>(null)

  // Use Form 
  const { register, handleSubmit, formState: { errors } } = useForm();

  // const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   //@ts-ignore
  //   console.log(e)
  //   const file = e.target.files[0]
  //   setimageFile(file)
  //   setimageUrl(URL.createObjectURL(file))
  // }

  const convertEditorDataToHTML = () => {
    return draftToHtml(convertToRaw(editorState.getCurrentContent()))
  }

  const handleEditorStateChange = (e: any) => {
    setEditorState(e)
  }




  const handlePost = async (data: any) => {



    const formData = new FormData
    const postData = JSON.stringify({
      title: headingRef.current?.innerText,
      description: convertEditorDataToHTML(),
      location: data.location,
      userId: session?.user.id,
      categoryId: data.category
    })

    formData.append('postData', postData)
    formData.append('image', data.image[0])

    // console.log(formData.get('postData'))
    // console.log(formData.get('image'))



    try {
      toast.loading('Sending your post to the World 🌎', { id: 'postData' })


      await fetch('http://localhost:3000/api/blogs', {
        method: "POST",
        body: formData,
        cache: 'no-store'
      })

      toast.success('Sending Completed 😺', { id: 'postData' })

    } catch (error) {
      toast.error('Sending failed 😹', { id: 'postData' })
      return console.log(error)
    }
  }

  useEffect(() => {
    const getAllCategories = async () => {
      const res = await fetch('http://localhost:3000/api/categories/', { cache: 'no-store' });
      const data = await res.json()

      setcategories(data.categories)

    }

    getAllCategories()

  }, [])



  return (
    <section className="w-full">

      <div className="flex  gap-4 justify-between p-4 items-center my-1">
        <div className="w-1/4">
          <span className="font-extrabold mx-3">Author</span>
          <span className="uppercase font-semibold">{session?.user?.name}</span>
        </div>
        <button
          onClick={handleSubmit(handlePost)}
          className="bg-violet-600 text-white px-6 focus:ring-violet-950 py-3 rounded-xl font-semibold h-20 shadow-xl hover:bg-violet-700">Publish</button>

      </div>



      {imageUrl && <Image className="mx-auto my-10 rounded-lg shadow-xl border-4 border-violet-700 h-80 object-cover" src={imageUrl} width={320} height={320} alt='Your blog img' />}

      <h1
        ref={headingRef}
        contentEditable='true' className="outline-none border-none font-serif mx-auto p-4 text-2xl text-center font-semibold w-full h-28 focus:border-none "

      >
        Enter title here...
      </h1>

      {/* File input */}
      <div className="w-full flex my-5">
        <input
          type="file" className="md:w-[500px] sm:w-[300px] m-auto text-slate-900   bg-gray-100 font-semibold rounded-xl p-4"

          {...register('image', {
            required: true,
            onChange(event) {

              setimageUrl(URL.createObjectURL(event.target.files[0]))
            }
          })}
        />
      </div>

      {/* Location input */}
      <div className="w-full flex my-5">
        <input
          type="text" className="md:w-[500px] sm:w-[300px] m-auto text-slate-900   bg-gray-100 font-semibold rounded-xl p-4"
          placeholder="Location Ex: United States"
          {...register('location', { required: true })}
        />
      </div>

      {/* Category Select  */}
      <div className="w-full flex my-5">
        <select

          className="md:w-[500px] sm:w-[300px] m-auto text-slate-900   bg-gray-100 font-semibold rounded-xl p-4"
          {...register('category', { required: true })}
        >
          {categories.map((item: { id: string, name: string }) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {/* Editor wysiwyg    */}
      <div className="w-full flex my-5 mx-5 items-center justify-center ">
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorStateChange}
          editorStyle={{ width: "100%", minHeight: "50vh", height: 'auto', border: '1px solid  #ded8d8', padding: '10px', backgroundColor: '#f3f4f68b', borderRadius: '16px' }} />
      </div>


    </section>
  )
}

export default BlogAdd