import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Provider from './context/Provider'
import Appbar from './components/Navbar'
import Footer from './components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Blogology',
  description: 'Best blogging app in the world',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

      <body className={inter.className}>
        <Provider>
          <div className=' min-h-screen flex flex-col'>
            <Appbar/>
            <main className='flex-1'>
              {children}
            </main>
            <Footer />
          </div>
        </Provider>
      </body>
    </html>
  )
}
