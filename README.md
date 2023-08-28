This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Getting Started

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

# Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

# Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Steps we will try to take

1. DB SETUP + Design
2. Next-auth
3. Api Design
4. Blogs Api Upload image
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

# 1 DB SETUP + Design

## Install

next13 command npx create-next-app@latest
prisma command npm I -D prisma
Init Prisma command npx prisma init

## Prisma

add provider = "prisma-client-js"
and datasource db {
provider = "mongodb"
url = env("DATABASE_URL")

on Env add url for MongoAtlas
}

## Create Prisma models

in Schema.prisma
Models needed are User, Blog, Category

sample
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "mongodb"
url = env("DATABASE_URL")
}

model User {
id String @id @default(auto()) @map("\_id") @db.ObjectId
name String?
email String @unique
password String
}

## Sync DB to MongoAtlas

command npx prisma db push 
Note: You should be able to see changes in MongoAtlas or any DB that you are using

## Create index.ts

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

# 2 Next-auth

we will work on installing nextAuth for authentication
Site: https://next-auth.js.org/getting-started/example

## connectToDb

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

## create register route

in app / api / auth / register/ router.ts

here we will create a reagistration route for users to register with credentials

First download bcrypt: command npm i bcrypt
than for typescrytt types with bctypt download npm i --save-dev @types/bcrypt

// Add this to route.ts

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

## go to postman

create user in postman
try to create user in postman via a POST req

// Add in body
{
"name": "carmen",
"email": "carmen@gmail.com",
"password": "123456"
}

## Install + Setup for NextAuth

Install comand npm install next-auth
then
To add NextAuth.js to a project create a file called [...nextauth].js insde app/api/[...nextauth] then crate a route.ts file

Note: contains the dynamic route handler for NextAuth.js which will also contain all of your global NextAuth.js configurations.

Note for Step Bellow i neeed the github and google secret an client id , Also need to create a secret and add all to .ENV

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

## Continue in NextAuth credentials login

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

## go to postman and try to login

try to login in postman or by going to
http://localhost:3000/api/auth/signin

Note try only credentials, social should not work untill we add the  
clientId and clientSecret for each provider

// Add in body
{
"email": "carmen@gmail.com",
"password": "123456"
}

Note if sucessfull in terminal on google in coookies you should see 3 items under nextAuth

## how to view session in server componets

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

## how to view session in Client componets

We must wrap our app in a session component

1.  create a new folder in app and call it context, inside create a file and call it Provider

2.  add this code
    'use client';

    import { SessionProvider } from "next-auth/react";

    const Provider = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider  >
    {children}
    </SessionProvider>
    )

    export default Provider;

3.  go to layout an wrapp app in provider
    <body className={inter.className}>
    <Provider>
    <main>
    {children}
    </main>
    </Provider>
    </body>

4.  create a test page (client) to view session
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

# 3 Api Design

## User API

In Api create a Users folder, here we will create our user api routes
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

## Create functions to stop using nextResponse

in Lib on the helpers folder create this 2 functions

    export const genereateSucessMessage = (data: any, status: number) => {
      return NextResponse.json({ message: 'success', ...data }, { status, statusText: 'OK' })
    }

    export const generateErrorMessage = (data: any, status: number) => {
      return NextResponse.json({ message: 'Error', ...data }, { status, statusText: 'ERROR' })
    }

## Categories Api

In Api create a categories folder, here we will create our categories api routes
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

Now You can test on Postman , test create and view all categories

CREATE GET SINGLE

in categories folder inside api , crate a [id] folder and inside a route.tsx file then enter this code to get single cateegory base on id

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

# 4 Blogs Api + Upload image

## Cloudinary Setup

    To be able to upload images we need to go to cloudiary and get

    1. Install cludinary
        command  = npm i cloudinary

    2. then on    https://cloudinary.com/
      you need to create account and then get all this info:

          CLOUDINARY_CLOUD_NAME=(add-here)
          CLOUDINARY_API_KEY=(add-here)
          CLOUDINARY_API_SECRET=(add-here)

    3. Add all this to .env

## GET ALL BLOGS

In Api create a blogs folder, here we will create our blogs api routes
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

## Create a Blog

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

## Blog [id] routes

in Api /blogs / create a [id] folder , inside create a route.tsx file

GET SINGLE BLOG -- UPDATE BLOG -- DELETE BLOG
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

## Blog search by blog title using Params ?

We will use this to search by title base on params ?
example /api/search?title=test

in Api / create a search folder , inside create a route.tsx file

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

# 5 Frontend

1. Edit Layout to make it full screen also edit title and description
2. go to page.tsx remove everithing and leave as sever component
3. create navbar component as client
4. create logo component as server
5. create footer component as server
6. add them to layout.tsx
7. create homecomponent as server

# 6 Homepage

1.  Create basic homepage structure
2.  Add image from unsplash.com
3.  Since image will be from an external website we need to add it to next.config.js plus restart server

    Code
    /\*_ @type {import('next').NextConfig} _/
    const nextConfig = {
    images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    },
    }

        module.exports = nextConfig

4.  should be able to see image
5.  create a function to getAllBlogs in helpers
    Since we migth re-user the blgos fucntion we can created in a separate location for easy reause on server components

    Code:

        export const getAllBlogs = async (count?: number) => {
          const res = await fetch('http://localhost:3000/api/blogs', { next: { revalidate: 5 } });
          const data = await res.json()


          if (count) {
            return data.blogs.slice(0, count)
          }
          return data.blogs
        }

6.  use the funciton on top of homecomponet to get all the blogs

    const blogs = await getAllBlogs(6)

7.  in Homecomponent display blogs using the map function

    {blogs?.map((blog) => (
    <div key={blog.id}> Hello </div>
    ))}

8.  create BlogItem component
    This will display each blog item card.

9.  create types file in lib, this will be use for typescript types

        export type BlogItemTypes = {
        id: string,
        title: string;
        description: string;
        imageUrl: string;
        userId: string;
        createdDate: string;
        updatedDate: string;
        categoryId: string;
        location: string;
        isProfile?: boolean

    }

    export type UserItemType = {
    id: string,
    name: string;
    email: string;
    Blogs: BlogItemTypes[];
    \_count: { Blogs: number };
    message: string
    }

10. In Homecomponent uset the BlogItemTypes for the blogs.map
    {blogs?.map((blog: BlogItemTypes) => (
    <BlogItem key={blog.id} {...blog} />
    ))}

Also pass the props to Blog Item

         <BlogItem key={blog.id} {...blog} />

11. In BlogItem receive props and display info in the newly created card.
12. Display props in card, also need to create a fucntion to retrieve the HTML from description

code:
function getTextFromHtml(html: string) {
const elem = document.createElement('span')
elem.innerHTML = html

          return elem.innerText
        }

13. then in the Description div use the line-clamp-6 , to limit the text to 6 lines

14. On the read more , make it a link that goes to  
    code:
    <Link href={`/blogs/${props.id}`} className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center ">

              <div className='flex justify-center items-center gap-2'>
                Read more
                <AiOutlineArrowRight size={18} />
            </div>
          </Link>

15. Add props types as BlogItemTypes

    code:

    const BlogItem = (props: BlogItemTypes) => {

    }

16. You should seee cards of all the blogs and they should be responsive

# 7 Blogs Page

1.  create a blogs page in the App folder , inside create page.tsx file
2.  create basic structure for a blogs page
    on top we need a search component and search button to filter by title, also a filter dropdown to filter by category

3.  below we just need a section to display all blogs

4.  in Lib folder create a function to get al catagories
    code:

    export const getAllCategories =async () => {
    const res = await fetch('http://localhost:3000/api/categories/' );
    const data = await res.json()

        return data.categories

    }

5.  in the blogs page import getAllCategories ,
    then call the funciton

    const categories = await getAllCategories()

    then user the function in the Filter select

code:

          <select name="category" id="select" className='md:px-5 xs:px-2 w-3/4 mx-2 py-3 rounded-lg' >
            {categories?.map((item: { id: string, name: string }) => (
              <option key={item.id} className='rounded-md bg-gray-100' value={item.id} > {item.name}</option>
            ))}
          </select>

5.  then call the getAllBlogs function on the blogs page

const blogs = await getAllBlogs(20)

6.  then use the getAllBlogs function to display all our blogs on the page

    code:

        {blogs?.map((blog: BlogItemTypes) => (
          <BlogItem key={blog.id} {...blog} />
        ))}

7.  you should be able to view blogs and the filter and search components will not work yet since we have not added the functionality

# 8 Add Blog page with RichText Editor

## Here we will create a page to add blogs to database

1.  Inside blogs folder create a new folder call it add , and inside create a page.tsx file
    this will be a client component per we will need state
2.  Install npm install -S react-draft-wysiwyg
    this is a text editor we will use to give the author more control on how their blogs look

3.  Grab the session
    Code:

    ```
    import { useSession } from "next-auth/react"

    const { data: session } = useSession()

    ```

    Note we will use the session to display the author name

4.  Crate an h1 with a ref={headingRef } add contentEditable='true' so that we can edit thei title within the H1

5.  install : npm i react-hook-form
    we will use thist to manage our form state
    then
    import { useForm } from "react-hook-form"

6.  In order to use react-hook-form we need to get the state bellow from useForm()

// Use Form
const { register, handleSubmit, formState: { errors } } = useForm();

7.  Create file input to upload images

    ```

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
    ```

Note: the code after the ... register is use to display the image on state change of our input of type FILE

8.  Try to see if you can select and view an image

9.  Create a location input :

    ```
        <div className="w-full flex my-5">
        <input
          type="text" className="md:w-[500px] sm:w-[300px] m-auto text-slate-900   bg-gray-100 font-semibold rounded-xl p-4"
          placeholder="Location Ex: United States"
          {...register('location', { required: true })}
        />
      </div>

    ```

10. Now we will work on creating a category select

    In order to get the categories we need to create a function to get them , this code must be added on top and outside our BlogAddPage fucntion

Code:

```
export const getAllCategories = async () => {
const res = await fetch('http://localhost:3000/api/categories/');
const data = await res.json()

return data.categories
}

```

11. Then we must call the getAllCategories in an UseEffect

    code

    ```
      useEffect(() => {
    const getAllCategories = async () => {
      const res = await fetch('http://localhost:3000/api/categories/', { cache: 'no-store' });
      const data = await res.json()

      setcategories(data.categories)

    }

    getAllCategories()

    }, [])
    ```

12. Create a category input :

    ```
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
    ```

13. Test that that you can see and select all categories

14. Now we will work on the wysiwyg text editor
    we will need to intall and get all this

    ```
      import { Editor } from 'react-draft-wysiwyg'
      import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
      import { EditorState, convertToRaw } from "draft-js"
      import draftToHtml from 'draftjs-to-html'
      import { toast } from "react-hot-toast"
    ```

Note : Also install types to remove Typescript warnings if any

15. create a fucntion to handle editor state change

    code

    ````
    const handleEditorStateChange = (e: any) => {
    setEditorState(e)
    }
    ```

    ````

16. get all data form form
    we first need to add an onclick function to our Publish button, so that we can get the data form react-hook-form

    onClick={handleSubmit(handlePost)}

17. Then we will create a function and call it handlePost , this will be use to get all the state form the form , and latter try to send it to the server

Note install: npm i react-hot-toast so that we can use alerts

Example toast.loading('Sending your post to the World 🌎', { id: 'postData' })

Code:

    ```
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

    ```

Note: you should get an error or the UserId , we will address this in step 19
userId: session?.user.id,

18. Note to use the react-draft-wysiwyg

    we need to use the import { EditorState, convertToRaw } from "draft-js"
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    to Handle Editor state:

         const handleEditorStateChange = (e: any) => {

    setEditorState(e)
    }

    To conver the data to Html use the draftToHtml import draftToHtml from draftjs-to-html

         const convertEditorDataToHTML = () => {
         return draftToHtml(convertToRaw(editorState.getCurrentContent()))
         }

19. Now before being able to Submit the post we need the UserID from the Session
    Go to the api/ auth /nextAuth folder

In callbacks add this code to get The UserID

Code :

    callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session
    },

},

20. Now if we go back to blogs / add / page.tsx
    and we console log the session we should be able to see an userId
    this id , we will use to submit the blog per we need the userId;

21. To remove warning from the userId in typescript do this:

Create a next-auth.d.ts file and add this code:

          import { DefaultSession } from "next-auth"

          declare module 'next-auth' {
            interface Session {
              user: {
                id: string
              } & DefaultSession['user']
            }
          }

22. Now you should be able to submit a blog ,
    Try It

# 9 BlogViewPage Page

1.  inside blogs folder create a view folder/ inside /create a folder [id] , inside this folder create a new file , call it page.tsx , and export it as BlogViewPage, Should be server component

Note : on the blog Item on the read more, this should be linked to

          <Link href={`/blogs/view/${props.id}`} className="self-end  mb-3 mr-2 text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2 text-center  w-fit ">

            <div className='flex  items-center gap-1'>
              Read more
              <AiOutlineArrowRight size={18} />
            </div>
          </Link>

2. In Lib helpers create a function to get blogs by Id

code:

```
  export const getBlogById = async (id: string) => {
   const res = await fetch(`http://localhost:3000/api/blogs/${id}`, { cache: 'no-store' })
   const data = await res.json()

   return data.blog
}
```

3. call the function on the BlogViewPage
   const blog = await getBlogById(params.id)

4. create a section to display blog content

   ```
    <section  className='w-full h-full flex flex-col mt-8 mb-20 '>


      <Image src={blog.imageUrl} alt={blog.title} height={400} width={400} className='md:w-2/4 xs:w-3/4 mx-auto shadow-xl rounded-lg' />

      <div className='md:w-2/4 xs:w-3/4 mx-auto  rounded-lg '>
        <h2 className='text-xl md:text-4xl   my-8 font-bold  text-center'  >{blog.title}</h2>
      </div>

      {/* html */}
      <section id='blogHtml' className='md:w-2/4 xs:w-3/4 mx-auto bg-slate-50 p-4'
        dangerouslySetInnerHTML={{ __html: blog.description }}
      ></section>

    </section>


   ```

5. We added and Id to the section Id: blogHtml we use this for stiling purposer

6. since we are using innerHtml as dangerouslySetInnerHTML,
   you can add css in the globals.css for lists and heading to your liking.

7. sample Css

   ```
          #blogHtml > h1 {
          color: red;
          padding: 10px;
          font-size: 25px;
          font: bold;
          margin-bottom: 20px;
          }

        #blogHtml > h2 {
        color: black;
        padding: 7px;
        font-size: 20px;

        margin-bottom: 14px;
        }

        #blogHtml > ul {
        padding: 20px;
        list-style: square;
        }

        #blogHtml li {
        color:rgb(60, 58, 58)
        }

        #blogHtml li:hover {
        color:red
        }

   ```

# 10 Profile Page

        ## Next Steps ----------------------------------------------- >>>

        ## Next Steps ----------------------------------------------- >>>

        ## Next Steps ----------------------------------------------- >>>

# 11 Edit + Delete Functionality

# 12 Search Page Functionality

# 13 Login + Signup pages

# 14 Optimization

# 15 add pagination

# 16 add filter by
