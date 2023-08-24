This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Steps we will try to take 
1. DB SETUP  + Design
2. Next-auth
3. Api Design 
4. Blogs Api  Upload image
5. Frontend
6. Homepage
7. Blogs Page
8. RichText Editor
9. View Page 
10. Profile Page
11. Edit + Delete Functionality 
12. Search Page Functionality
13. Login + Signup pages
14. Optimization 


## 1 DB SETUP  + Design 

## Install 
next13 command  npx create-next-app@latest
prisma  command  npm I -D prisma
  Init Prisma command npx prisma init


## Prisma
add provider = "prisma-client-js"
and datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")

  on Env add url for MongoAtlas 
}


# Create Prisma models
in Schema.prisma
Models needed are  User, Blog, Category 

sample 
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id       String   @id @default(auto()) @map("_id") @db.ObjectId
  name     String?
  email    String   @unique
  password String
}

# Sync DB to MongoAtlas
command npx prisma db push 
 Note: You should be able to see changes in MongoAtlas or any DB that you are using 


# Create index.ts 
Do this to prevent Prisma from creating multiple coneciton 
      import { PrismaClient } from "@prisma/client";

      let prisma: PrismaClient;
      declare global {
        namespace NodeJS {
          interface Global {
            prisma: PrismaClient;
          }
        }
      }

      if (process.env.NODE_ENV === "production") {
        prisma = new PrismaClient();
      } else {
        if (!global.prisma) {
          global.prisma = new PrismaClient();
        }
        prisma = global.prisma;
      }

      export default prisma;




## 2 Next-auth
  we will work on installing nextAuth for authentication 
 Site:  https://next-auth.js.org/getting-started/example





# connectToDb 
create a folder and call it: lib
in lib folder create a file name : helpers.ts

and create connect function 

     import prisma from "@/prisma"

      export const connectToDb = async () => {
      try {
        await prisma.$connect()
      } catch (err: any) {
        throw new Error(err)
      }
    }


  
  # create  register route 
  in app / api / auth / register/ router.ts 

  here we will create a  reagistration route for users to register with credentials


First download bcrypt: command npm i bcrypt 
than for typescrytt types with bctypt download   npm i --save-dev @types/bcrypt

// Add this to  route.ts 

import { connectToDb } from "@/lib/helpers"
import prisma from "@/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

export const POST = async (req: Request) => {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Invalid Data' }, { status: 422 })
  }


  try {
    await connectToDb()

    const hashedPassword = await bcrypt.hash(password, 10)


    const user = await prisma.user.create({ data: { email, name, password: hashedPassword } })

    return NextResponse.json({ message: 'User Created Successfully', ...user }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json({ message: 'Server Error', ...error }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }

}


# go to postman 
create user in postman
try to create user in postman  via  a POST req

// Add in body 
{
    "name": "carmen",
    "email": "carmen@gmail.com",
    "password": "123456"
}


# Install + Setup for NextAuth 
Install comand npm install next-auth
then 
To add NextAuth.js to a project create a file called [...nextauth].js insde app/api/[...nextauth] then crate a route.ts file  

Note:  contains the dynamic route handler for NextAuth.js which will also contain all of your global NextAuth.js configurations.


Note for Step Bellow i neeed the github and google  secret an client id , Also need to create a secret and add all to .ENV  

NEXTAUTH_SECRET="create-a-secret-here"
   Note you can create one with Command openssl rand -base64 32

GITHUB_CLIENT_ID='your-clientId-here'
GITHUB_CLIENT_SECRET='your-client-secret-here'

GOOGLE_CLIENT_ID=''your-secret-here'
GOOGLE_CLIENT_SECRET='GOCSPX-your-client-secret-here'




Sample folder content   

        import NextAuth from "next-auth"
        import GithubProvider from "next-auth/providers/github"

        export const authOptions = {
          // Configure one or more authentication providers
          providers: [
            GithubProvider({
              clientId: process.env.GITHUB_ID,
              clientSecret: process.env.GITHUB_SECRET,
            }),
            // ...add more providers here
          ],
        }

        export default NextAuth(authOptions)



# Continue in NextAuth  credentials login
  Add this code
        CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
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



          // return user
          return user


        } catch (error) {
          return null
        } finally {
          await prisma.$disconnect()
        }

      },
    }),


# go to postman  and try to login  
try to  login in postman or by going to 
http://localhost:3000/api/auth/signin

Note try only credentials, social should not work untill we add the  
clientId and clientSecret for each provider

// Add in body 
{
    "email": "carmen@gmail.com",
    "password": "123456"
}

Note if sucessfull in  terminal on google in coookies you should see 3 items under nextAuth


# how to  view session in server componets
Try going to page.tsx and enter this code 

 Use code 
  import { getServerSession } from "next-auth"
  import { authOptions } from "./api/auth/[...nextauth]/route"


  export default async function Home() {

    const data = await getServerSession(authOptions)

    return (
      <div>
        <h2>Server</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }

# how to  view session in Client componets
  We must wrap our app in a session component

  1. create a new folder in app and call it context, inside create a file and call it Provider

  2. add this code 
      'use client';

        import { SessionProvider } from "next-auth/react";

        const Provider = ({ children }: { children: React.ReactNode }) => (
          <SessionProvider  >
            {children}
          </SessionProvider>
        )

        export default Provider;


  3. go to layout an wrapp app in provider 
          <body className={inter.className}>
            <Provider>
              <main>
                {children}
              </main>
            </Provider>
          </body>


  3. create a test page (client) to view  session 
    In app create a folder (pages) , inside create , Folder TestingSessionPage, inside cratre a page.tsx

    code 
        'use client'

        import { useSession } from "next-auth/react"

        const TestingSessionPage = () => {

          const { data, status } = useSession()

          return (
            <div>
              <h2>Client</h2>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )
        }

        export default TestingSessionPage

Note you should see session data on the screen 
note the expires is one month from now



## 3 Api Design 


#  User API

In Api create a Users folder, here we will  create our user api routes
then create a file call it route.ts

GET ALL USERS  

Code: 
    import { connectToDb } from "@/lib/helpers"
    import prisma from "@/prisma"
    import { NextResponse } from "next/server"

    export const GET = async () => {
      try {
        await connectToDb()
        const users = await prisma.user.findMany()

        return NextResponse.json({ message: 'Success', users }, { status: 200 })
      } catch (error) {
        return NextResponse.json({ message: 'Error', error }, { status: 500 })
      } finally {
        await prisma.$disconnect()
      }
    }

Note can test it in postman or by going to
 http://localhost:3000/api/users

In users create a new folder call it [id] and inside it a file route.ts

GET SINGLE USER

 Code 
    import { connectToDb } from "@/lib/helpers"
    import prisma from "@/prisma"
    import { NextResponse } from "next/server"

    export const GET = async (req: Request, { params }: { params: { id: string } }) => {


      if (!params?.id) return
      try {
        await connectToDb()
        const user = await prisma.user.findFirst({
          where: { id: params.id },
          include: { blogs: true, _count: true }
        })


        return NextResponse.json({ message: 'Success', user }, { status: 200 })
      } catch (error) {
        return NextResponse.json({ message: 'Error', error }, { status: 500 })
      } finally {
        await prisma.$disconnect()
      }
    }


Note can test it in postman or by going to
 http://localhost:3000/api/users/{user-id-here}



# Create functions to  stop using nextResponse 
in Lib  on the helpers  folder create this 2 functions 

    export const genereateSucessMessage = (data: any, status: number) => {
      return NextResponse.json({ message: 'success', data }, { status, statusText: 'OK' })
    }

    export const generateErrorMessage = (data: any, status: number) => {
      return NextResponse.json({ message: 'Error', data }, { status, statusText: 'ERROR' })
    }




#  Categories Api


  In Api create a categories folder, here we will  create our categories api routes
  then create a file call it route.ts

  GET ALL CATEGORIES  

  
      import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
      import prisma from "@/prisma"
      import { NextResponse } from "next/server"

        export const GET = async () => {
          try {
            await connectToDb()
            const categories = await prisma.category.findMany()

            return genereateSucessMessage(categories, 200)

          } catch (error) {
            
            return generateErrorMessage(error, 500)

          } finally {
            await prisma.$disconnect()
          }
        }



  CREATE CATEGORY


        export const POST = async (req: Request) => {

          const { name } = await req.json()

          try {
            await connectToDb()
            const category = await prisma.category.create({ data: { name } })

            return genereateSucessMessage({ category }, 200)
          } catch (error) {
            return generateErrorMessage({ error }, 500)
          } finally {
            await prisma.$disconnect()
          }
        }


  Note can go to Postman and attempt to create category
  Note : since in categories schema we use an ENUM we can only accept this names:
   art, education, science, politics


Now You can test on  Postman , test create and  view all categories




  CREATE GET SINGLE 

  in  categories folder inside api , crate a  [id] folder and inside a route.tsx file then  enter this code  to get single cateegory base on id


          import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
          import prisma from "@/prisma"
          import { NextResponse } from "next/server"

          export const GET = async (req: Request, { params }: { params: { id: string } }) => {


            if (!params?.id) return
            try {
              await connectToDb()
              const category = await prisma.category.findFirst({
                where: { id: params.id },
                include: { _count: true,  blogs: true, }
              })

              return genereateSucessMessage(category, 200)

            } catch (error) {

              return generateErrorMessage(error, 500)

            } finally {
              await prisma.$disconnect()
            }
          }



    Note:    Now You can test on  Postman 






## 4 Blogs Api  + Upload image



# Cloudinary Setup 

    To be able to upload images we need to go to cloudiary and get

    1. Install cludinary 
        command  = npm i cloudinary

    2. then on    https://cloudinary.com/
      you need to create account and then get all this info: 

          CLOUDINARY_CLOUD_NAME=(add-here)
          CLOUDINARY_API_KEY=(add-here)
          CLOUDINARY_API_SECRET=(add-here)

    3. Add all this to .env





# GET ALL BLOGS

 In Api create a blogs folder, here we will  create our blogs api routes
  then create a file call it route.ts


    import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
    import prisma from "@/prisma"
    import { NextResponse } from "next/server"

    export const GET = async () => {
      try {
        await connectToDb()
        const blogs = await prisma.blog.findMany()


        return genereateSucessMessage(blogs, 200)
      } catch (error) {
        return generateErrorMessage(error, 500)

      } finally {
        await prisma.$disconnect()
      }
    }


# Create a Blog 
      import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
      import prisma from "@/prisma"
      import { v2, UploadApiResponse } from 'cloudinary'




      async function uploadImage(file: Blob) {
        return new Promise<UploadApiResponse>(async (resolve, reject) => {

          const buffer = Buffer.from(await file.arrayBuffer())

          v2.uploader.upload_stream({ resource_type: "auto", folder: "nextjs-full-stack-blog" }, (err, result) => {
            if (err) {
              console.log(err)
              return reject(err)
            } else if (result) {
              resolve(result)
            }
          }).end(buffer)

        })

      }




      export const POST = async (req: Request) => {

        v2.config({

          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });

        try {
          await connectToDb()


          const formData = await req.formData()
          const { title, description, location, userId, categoryId } = JSON.parse(formData.get('postData') as string)

          if (!title || !description || !location || !userId || !categoryId) return generateErrorMessage({ reason: "invalid Data" }, 422)

          const file = formData.get('image') as Blob | null




          // upload image
          let uploadedFile: UploadApiResponse | null = null

          if (file) {
            uploadedFile = await uploadImage(file)
          } else {
            uploadedFile = null
          }

          await connectToDb()
          const user = await prisma.user.findFirst({ where: { id: userId } })
          const category = await prisma.category.findFirst({ where: { id: categoryId } })


          if (!user || !category) return generateErrorMessage({ reason: "invalid User or Category Id" }, 401)

          const blog = await prisma.blog.create({
            data:
              { title, description, location, categoryId, userId, imageUrl: uploadedFile?.url ?? null }
          })

          return genereateSucessMessage({ blog }, 201)
        } catch (error) {
          return generateErrorMessage({ error }, 500)
        } finally {
          await prisma.$disconnect()
        }
      }


Note test in Postman


# Blog [id] routes

in  Api /blogs / create a [id] folder , inside create a route.tsx file


GET SINGLE  BLOG -- UPDATE BLOG -- DELETE BLOG
code:

        import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
        import prisma from "@/prisma"


        export const GET = async (req: Request, { params }: { params: { id: string } }) => {

          try {
            await connectToDb()
            const blog = await prisma.blog.findFirst({ where: { id: params.id } })

            return genereateSucessMessage({ blog }, 200)
          } catch (error) {
            return generateErrorMessage({ error }, 500)
          } finally {
            await prisma.$disconnect()
          }
        }


        export const PUT = async (req: Request, { params }: { params: { id: string } }) => {

          try {

            const { title, description } = await req.json()
            if (!title || !description) {
              return generateErrorMessage({ reason: 'Invalid Data' }, 422)
            }

            await connectToDb()
            const blog = await prisma.blog.update({
              where: { id: params.id },
              data: { title, description }
            })

            return genereateSucessMessage({ blog }, 200)
          } catch (error) {
            return generateErrorMessage({ error }, 500)
          } finally {
            await prisma.$disconnect()
          }
        }


        export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {

          try {
            await connectToDb()
            const blog = await prisma.blog.delete({ where: { id: params.id } })

            return genereateSucessMessage({ blog }, 200)
          } catch (error) {
            return generateErrorMessage({ error }, 500)
          } finally {
            await prisma.$disconnect()
          }
        }



Note test All 3 in Postman

# Blog search by  blog title using Params  ?

We will use this to search by title base on params ?
example /api/search?title=test


in  Api / create a search folder , inside create a route.tsx file

code: 

        import { connectToDb, generateErrorMessage, genereateSucessMessage } from "@/lib/helpers"
        import prisma from "@/prisma"


        export const GET = async (req: Request) => {

          const searchTitle = new URL(req.url).searchParams.get('title')
          console.log(searchTitle)

          try {
            await connectToDb()
            const blogs = await prisma.blog.findMany({
              where:
                { title: { contains: searchTitle ?? '' } }
            })

            return genereateSucessMessage({ blogs }, 200)
          } catch (error) {
            return generateErrorMessage({ error }, 500)
          } finally {
            await prisma.$disconnect()
          }
        }

Note test Search in Postman




## 5 Frontend



1. Edit Layout to make it full screen  also edit title and description 
2. go to page.tsx  remove everithing and leave as sever component
3. create navbar component as client
4. create logo component as server 
4. create footer component as server 
5. add them to  layout.tsx 
5. create home component as server








## 6 Homepage




## Next Steps -----------------------------------------------   >>> 
## Next Steps -----------------------------------------------   >>> 
## Next Steps -----------------------------------------------   >>> 
  

## 7 Blogs Page
## 8 RichText Editor
## 9 View Page 
## 10 Profile Page
## 11 Edit + Delete Functionality 
## 12 Search Page Functionality
## 13 Login + Signup pages
## 14 Optimization 