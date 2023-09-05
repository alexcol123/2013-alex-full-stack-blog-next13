'use client'

import { useState } from 'react'

import { FiLogOut } from 'react-icons/fi';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useForm } from 'react-hook-form'

import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc'
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import Logo from '@/app/components/Logo';



const Register = () => {

  const router = useRouter()

  const { register, handleSubmit } = useForm()
  const [showPassword, setshowPassword] = useState(false)


  const registerWithCredential = async (data: any) => {

    toast.loading('signing in', { id: '1' })
    try {
      // await signIn('credentials', { ...data, callbackUrl: 'http://localhost:3000/' })

      await fetch('http://localhost:3000/api/auth/register', {
        method: "POST",
        body: JSON.stringify({ ...data })
      })


      toast.success('signing in Successfull', { id: '1' })
      router.push('/login')

    } catch (error) {
      console.log(error)
      toast.error('Error signing in', { id: '1' })
    }
  }


  // Social media Register  google or github
  const passwordLessSignIn = async (type: 'google' | "github") => {

    toast.loading('signing in', { id: '1' })
    try {
      await signIn(type, { callbackUrl: 'http://localhost:3000/profile' })

      toast.loading('signing in Successfull', { id: '1' })

    } catch (error) {
      console.log(error)
      toast.loading('Error signing in', { id: '1' })
    }
  }





  return (
    <section className='w-full h-full flex flex-col'>
      <div className="mx-auto rounded-xl bg-slate-200 my-10 px-10 py-5">
        <div className="m-auto p-4 text-center">
          <span className="font-extrabold text-xl">Register To</span> <Logo />
        </div>
        <div className="flex flex-col">

          {/* name input */}
          <label className='font-semibold text-xl  text-slate-900 ' htmlFor="email" >Name</label>
          <div className="flex items-center justify-between bg-gray-100 my-3 px-6 py-4 rounded-xl text-gray-900 font-semibold">
            <input type="text" placeholder='Ex: Jin Kazama' className='bg-transparent  p-1 border-none  outline-none' {...register('name')} />
          </div>


          {/* email input */}
          <label className='font-semibold text-xl  text-slate-900 ' htmlFor="email" >Email</label>
          <div className="flex items-center justify-between bg-gray-100 my-3 px-6 py-4 rounded-xl text-gray-900 font-semibold">
            <input type="email" placeholder='Ex: Jin@gmail.com' className='bg-transparent  p-1 border-none  outline-none' {...register('email')} />
          </div>

          {/* password input */}
          <label className='font-semibold text-xl  text-slate-900 ' htmlFor="pasword" >Password</label>
          <div className="flex items-center justify-between bg-gray-100 my-3 px-6 py-4 rounded-xl text-gray-900 font-semibold">
            <input placeholder='1234567' type={showPassword ? 'text' : 'password'} className='bg-transparent  p-1 border-none  outline-none' {...register('password')} />

            {showPassword ? <FiEye size={25} onClick={() => setshowPassword(!showPassword)} /> : <FiEyeOff ize={25} onClick={() => setshowPassword(!showPassword)}

            />}
          </div>




          {/* Button credentials */}
          <button
            onClick={handleSubmit(registerWithCredential)}
            className="my-2 font-bold   border-[1px] px-6 py-3 flex items-center justify-center bg-violet-500 text-white   rounded-xl hover:bg-violet-600 gap-3 duration 300 ">
            Register <span><FiLogOut size={20} /> </span>
          </button>

          <h1 className='text-center font-semibold my-4 text-lg'>Social Media Register</h1>

          {/* Button Github */}
          <button onClick={() => passwordLessSignIn('github')} className="my-2 font-semibold   border border-gray-200 px-6 py-3 flex items-center justify-center bg-slate-50   rounded-xl hover:bg-slate-100  hover:border-violet-400 gap-3 duration 300 ">
            <span><FaGithub size={20} /> </span>Continue with Github
          </button>

          {/* Button Google */}
          <button onClick={() => passwordLessSignIn('google')} className="my-2 font-semibold   border border-gray-200 px-6 py-3 flex items-center justify-center bg-slate-50   rounded-xl hover:bg-slate-100  hover:border-violet-400 gap-3 duration 300 ">
            <span><FcGoogle size={20} /> </span> Continue with Google
          </button>

        </div>
      </div>
    </section>
  )
}

export default Register