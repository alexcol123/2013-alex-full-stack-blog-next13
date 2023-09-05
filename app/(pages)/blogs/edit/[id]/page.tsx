'use client'


import { useSession } from "next-auth/react"
import { ChangeEvent, useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { ContentState, EditorState, convertFromHTML, convertToRaw } from "draft-js"
import draftToHtml from 'draftjs-to-html'
import { toast, Toaster } from "react-hot-toast"
import { BlogItemTypes } from "@/lib/types";


const EditBlog = ({ params }: { params: { id: string } }) => {

  const router = useRouter()

  const [IsLoading, setIsLoading] = useState(false)
  const [categories, setcategories] = useState([])
  const { data: session } = useSession()
  const [myCurentBlog, setmyCurentBlog] = useState(null)

  const [imageUrl, setimageUrl] = useState('')
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [imageFile, setimageFile] = useState<File | null>(null)
  const headingRef = useRef<HTMLHeadElement | null>(null)


  const convertEditorDataToHTML = () => {
    return draftToHtml(convertToRaw(editorState.getCurrentContent()))
  }

  const handleEditorStateChange = (e: any) => {
    setEditorState(e)
  }


  const getBlogById = async (id: string) => {
    const res = await fetch('http://localhost:3000/api/blogs/' + id, { cache: 'no-store' });
    const data = await res.json()

    return data.blog
  }


  const updateBlog = async (id: string, postData: any) => {
    const res = await fetch('http://localhost:3000/api/blogs/' + id, {
      cache: 'no-store',
      method: "PUT", body: JSON.stringify({ ...postData })
    },
    );
    const data = await res.json()

   // console.log(data)
    return data.blog
  }


  const handlePost = async () => {

    console.log(headingRef.current?.innerText)
    console.log(convertEditorDataToHTML())

    const postData = { title: headingRef.current?.innerText, description: convertEditorDataToHTML() }
    try {
      toast.loading('Updating your Post ', { id: 'postData' })
      await (updateBlog(params.id, postData))


      toast.success('Update Completed 😺', { id: 'postData' })


      router.push('/profile')

    } catch (error) {
      toast.error('Update failed 😹', { id: 'postData' })
      return console.log(error)
    }
  }


  useEffect(() => {

    setIsLoading(true)
    toast.loading('Updating Blog Details', { id: 'loading' })

    // Gets blog data
    getBlogById(params.id)

      //  Converts conent so editor can show it
      .then((data: BlogItemTypes) => {
        const contentBlocks = convertFromHTML(data.description)
        const contentState = ContentState.createFromBlockArray(contentBlocks.contentBlocks)

        const initialState = EditorState.createWithContent(contentState)
        setEditorState(initialState)

        // shows title 
        if (headingRef && headingRef.current) headingRef.current.innerText = data.title

        setIsLoading(false)
        toast.success('Blot Details Updated ', { id: 'loading' })


      }).catch(err => {
        console.log(err)
        toast.success('Error Updating Blog ', { id: 'loading' })
      }).finally(() => {

        setIsLoading(false)

      })
  }, [])








  return (
    <section className="w-full">
      <Toaster position="top-right" />

      <div className="flex  gap-4 justify-between p-4 items-center my-1">
        <div className="w-1/4">
          <span className="font-extrabold mx-3">Author</span>
          <span className="uppercase font-semibold">{session?.user?.name}</span>
        </div>
        <button
          onClick={handlePost}
          className="bg-violet-600 text-white px-6 focus:ring-violet-950 py-3 rounded-xl font-semibold h-20 shadow-xl hover:bg-violet-700">Publish</button>

      </div>



      <h1
        ref={headingRef}
        contentEditable='true' className="outline-none border-none font-serif mx-auto p-4 text-2xl text-center font-semibold w-full h-28 focus:border-none "

      >
        Enter title here...
      </h1>





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



export default EditBlog