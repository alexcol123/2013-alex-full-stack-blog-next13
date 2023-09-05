'use client'

import { useState } from 'react'

import { FiLogOut } from 'react-icons/fi';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc'
import Logo from '@/app/components/Logo';


const Login = () => {
  const { register, handleSubmit } = useForm()
  const [showPassword, setshowPassword] = useState(false)


  const signInWithCreds = async (data: any) => {

    toast.loading('signing in', { id: '1' })
    try {
      await signIn('credentials', { ...data, callbackUrl: 'http://localhost:3000/' })

      toast.success('signing in Successfull', { id: '1' })

    } catch (error) {
      console.log(error)
      toast.error('Error signing in', { id: '1' })
    }
  }


  // Social media login  google or github
  const passwordLessSignIn = async (type: 'google' | "github") => {

    toast.loading('signing in', { id: '1' })
    try {
      await signIn(type, { callbackUrl: 'http://localhost:3000/profile' })

      toast.success('signing in Successfull', { id: '1' })

    } catch (error) {
      console.log(error)
      toast.error('Error signing in', { id: '1' })
    }
  }





  return (
    <section className='w-full h-full flex flex-col'>
      <div className="mx-auto rounded-xl bg-slate-200 my-10 px-10 py-5">
        <div className="m-auto p-4 text-center">
          <span className="font-extrabold text-xl">Login To</span> <Logo />
        </div>
        <div className="flex flex-col">
          {/* email input */}
          <label className='font-semibold text-xl text-center text-slate-900 ' htmlFor="email" >Email</label>
          <div className="flex items-center justify-between bg-gray-100 my-4 px-6 py-4 rounded-xl text-gray-900 font-semibold">
            <input type="email" className='bg-transparent  p-1 border-none  outline-none' {...register('email')} />
          </div>

          {/* password input */}
          <label className='font-semibold text-xl text-center text-slate-900 ' htmlFor="pasword" >Password</label>
          <div className="flex items-center justify-between bg-gray-100 my-4 px-6 py-4 rounded-xl text-gray-900 font-semibold">
            <input type={showPassword ? 'text' : 'password'} className='bg-transparent  p-1 border-none  outline-none' {...register('password')} />

            {showPassword ? <FiEye size={25} onClick={() => setshowPassword(!showPassword)} /> : <FiEyeOff ize={25} onClick={() => setshowPassword(!showPassword)}

            />}
          </div>




          {/* Button credentials */}
          <button
            onClick={handleSubmit(signInWithCreds)}
            className="my-2 font-bold   border-[1px] px-6 py-3 flex items-center justify-center bg-violet-500 text-white   rounded-xl hover:bg-violet-600 gap-3 duration 300 ">
            Login <span><FiLogOut size={20} /> </span>
          </button>

          <h1 className='text-center font-semibold my-4 text-lg'>Social Media Login</h1>

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

export default Login