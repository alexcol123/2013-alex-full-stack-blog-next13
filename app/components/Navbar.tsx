"use client"

import React from 'react'
import Logo from './Logo'
import { signOut, useSession } from 'next-auth/react'

import Link from 'next/link'

const authlinks = [
  { id: 1, name: 'Blogs', url: '/blogs' },
  { id: 2, name: 'Write', url: '/blogs/add' },
  { id: 3, name: 'Profile', url: '/profile' },
  { id: 4, name: 'Search', url: '/search' }
]


const nonAuthlinks = [
  { id: 5, name: 'Blogs', url: '/blogs' },
  { id: 6, name: 'Login', url: '/login' },
  { id: 7, name: 'Register', url: '/register' },

]

const Appbar = () => {

  const { status } = useSession()

  return (
    <section className='sticky w-full bg-gray-100'>

      <nav className="flex items-center justify-between px-8 py-4 bg-transparent">
        <div>
          <Logo />
        </div>
        <div className="flex item-center gap-4 p-2">
          {(status === 'authenticated' ? authlinks : nonAuthlinks).map((item) => (
            <Link key={item.id} href={item.url} className='text-gray-900 text-lg font-semibold hover:text-violet-600 duration-300' >
              {item.name}
            </Link>
          ))}
          {status === 'authenticated' && <button className='bg-violet-500 px-2 rounded text-slate-100 hover:bg-violet-700 font-semibold shadow' onClick={() => signOut({ callbackUrl: 'http://localhost:3000/login' })} >Logout</button>}



        </div>

      </nav>
    </section>
  )
}

export default Appbar