import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <Link href={'/'} className='text-gray-700 text-lg font-extrabold tracking-wider' >
      <span className="text-violet-600 font-bold text-2xl ">B</span>{"logify"}
    </Link>
  )
}

export default Logo