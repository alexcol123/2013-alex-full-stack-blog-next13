import NextAuth from 'next-auth/next'

import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import prisma from '@/prisma'
import bcrypt from 'bcrypt'
import { connectToDb, verifyUsrDetailsAtLogin, } from '@/lib/helpers'


export const authOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),



    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // const user = { id: 1, name: 'Alex', email: 'alex@gmail.com' }
        // return user

        // check to see if email and password is there
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error('Please enter an email and password')
        }

        try {
          await connectToDb()

          // check to see if user exists
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })



          // if no user was found
          if (!user || !user?.password) {
            throw new Error('No user found')
          }

          // check to see if password matches
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )

          // if password does not match
          if (!passwordMatch) {
            throw new Error('Incorrect password')
          }

          //    console.log(user)

          // return user
          return user




        } catch (error) {
          return null
        } finally {
          await prisma.$disconnect()
        }

      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      //   console.log('session ====================')

      //    console.log(session)


      //  console.log('token ====================')

      //    console.log(token)


      return session
    },

    async signIn({ account, user, profile }) {

      // If social login 
      if (account.provider === 'github' || account.provider === 'google') {



        const newUser = await verifyUsrDetailsAtLogin(user)

        if (typeof newUser !== null) {
          user.id = newUser?.id

          if (profile && profile.sub) {
            profile.sub = newUser?.id
          }
        }

      }

      // if not social login skip 
      return true
    },

  },


  pages: {
    signIn: '/login',

    // Other sample pages , if we had signout pages or error  (not needed for this project)
    // signOut: '/',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// 64dbac241bc81e10e8cfe453