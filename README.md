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

1.  Create a profile folder in pages, then create a page.tsx file
    export it as ProfilePage

    Note: Here we will display Iamge , Name , email , then we will show the blog count

2.  We need user info , so we need in lib helpers we need to create a function to get User,

        ```
        export const getUserById = async (id: string) => {

          console.log('id  user ',id)
          const res = await fetch('http://localhost:3000/api/users/' + id, { cache: 'no-store' });

          const data = await res.json()

          return data
        }

        ```

3.  Before we can Call the new getUserById function we need to userId From the session function

import { getServerSession } from 'next-auth'

const sessionData = await getServerSession(authOptions)

4.  Now we can call the getUserById and pass the Id as argument
    this will provide us not only the user info but the blogs, since we set it up in prisma and in the API / users/ [id]/ GET , where we add the include:

code below :

```
    const user = await prisma.user.findFirst({
      where: { id: params.id },
      include: { blogs: true, _count: true }
    })
```

You can console log it and view all user data

```

  const sessionData = await getServerSession(authOptions)

  const userData = await getUserById(sessionData?.user?.id)


   console.log( userData)


```

5. now that we have the data we can display it in the profilePage

   ```
         import Image from 'next/image'
         import React from 'react'
         import { MdAttachEmail } from 'react-icons/md'
         import UserIcon from '@/public/userIcon.png'
         import { getAllBlogs, getUserById } from '@/lib/helpers'
         import BlogItem from '../../components/BlogItem'
         import { BlogItemTypes, UserItemType } from '@/lib/types'
         import { getServerSession } from 'next-auth'
         import { authOptions } from '../../api/auth/[...nextauth]/route'



         const Profile = async () => {

           const sessionData = await getServerSession(authOptions)

           const userData = await getUserById(sessionData?.user?.id)
           console.log(userData.blog)

           return (

             <section className='w-full h-full flex flex-col '>
               <div>
                 <Image src={sessionData?.user.image ?? UserIcon} alt='UserProfile ' width={200} height={200} className='h-20 w-20 object-cover mx-auto my-8 rounded-full bg-gray-50 border-4 border-purple-400 ' />
               </div>
               <div className=" mx-auto my-2">
                 <h1 className="text-4xl font-semibold  w-fit  rounded-md capitalize">
                   {sessionData?.user.name}
                 </h1>
               </div>

               <div className=" mx-auto my-2">
                 <h1 className="text-xl font-semibold  flex items-center   w-fit gap-1">
                   <span> <MdAttachEmail /> </span>             {sessionData?.user.email}
                 </h1>
               </div>

               <div className="w-full h-full flex flex-col">
                 <div className='w-2/4 mx-auto'>
                   <p className='text-center font-semibold text-xl  text-gray-50 bg-gray-400 border shadow-lg w-fit mx-auto rounded-md px-2'>🌟 Blogs Count: {userData?._count?.blogs} </p>
                 </div>

                 <div className="flex flex-wrap justy-center p-4 my-3">
                   {userData?.blogs?.map((blog: BlogItemTypes) => <BlogItem key={blog.id} {...blog} isProfile={true} />)}
                 </div>


               </div>
               {/* {JSON.stringify(userData.Blogs)} */}
             </section>
           )
         }

         export default Profile

   ```

6. Add buttons to Edit
   in type propes add isProfileProperty: boolean

then add the isProfile to Lib/ types/ in the BlogItemTypes
and set to boolean make it conditional

      isProfile?: boolean

Note : we will use this to add an edit button to the BlogItem component if is in profile

7. Now in the Profile page we will send the props to let it know is on profile mod

code

```
      <div className="flex flex-wrap justy-center p-4 my-3 gap-8">
          {userData?.blogs?.map((blog: BlogItemTypes) => <BlogItem key={blog.id} {...blog} isProfile={true} />)}
        </div>
```

8. Now we will recieve the props in the blogItem component and here we will add buttons to disblay to delete and edit the blog

code:

```
      'use client'


      import { BlogItemTypes } from '@/lib/types'
      import Image from 'next/image'
      import Link from 'next/link'
      import { ReactDOM, } from 'react'
      import { AiOutlineArrowRight } from 'react-icons/ai'
      import { RiDeleteBin6Fill } from 'react-icons/ri';
      import { MdLocationOn } from 'react-icons/md'


      function getTextFromHtml(html: string) {
        const elem = document.createElement('span')
        elem.innerHTML = html


        return elem.innerText
      }

      const BlogItem = (props: BlogItemTypes) => {



        let shortDescription = getTextFromHtml(props?.description)






        return (
          <div className="max-w-md mx-auto">

            <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm w-[370px] min-h-[450px] flex flex-col relative ">

              <div className='relative h-[200px] '>
                <Image src={props.imageUrl} width='200' height='200' alt='blog image' className='object-cover object-center w-full z-1  h-48 ' />

                <div className=' absolute top-0 right-0 z-2 bg-gray-200 m-2 p-1 rounded flex items-center justify-center font-semibold'> <MdLocationOn size={20} className='text-purple-600' /> {props.location}</div>
              </div>


              <div className="  px-2 flex flex-col flex-1 h-full">

                <h5 className="text-gray-900 font-bold text-2xl tracking-tight mb-2 capitalize ">{props.title}</h5>

                <p className="font-normal   text-gray-700 my-6  line-clamp-4 mb-auto">{shortDescription}</p>

                <div className='flex justify-around items-center mb-2 gap-4'>

                  <Link href={`/blogs/view/${props.id}`} className=" w-full text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm p-3 text-center   ">

                    <div className='flex  items-center justify-center gap-1 text-center'>
                      Read more
                      <AiOutlineArrowRight size={18} />
                    </div>
                  </Link>



                  {props.isProfile && <Link href={`blogs/edit/${props.id}`} className="w-full text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm p-3 text-center
                  ">Edit</Link>
                  }
                </div>



                {props.isProfile && <button
                  //onClick={handleDelete}
                  className=' absolute top-2 left-2 text-red-500 border  bg-white opacity-80 shadow-sm rounded-full p-2 hover:opacity-100 duration-500'><RiDeleteBin6Fill size={30} /></button>}

              </div>
            </div>
          </div>
        )
      }

      export default BlogItem

```

9. note if you login with social media and you have an image on your social media you will be able to see it in the Profile page

# 11 Edit + Delete Functionality

1.  In blogs create a folder edit folder then / [id] / page.tsx component and export it as EditBlog,

Note: must be client component

2.  All we will be able to edit is the title and the blog content.

3.  get params as we have done in the past
    { params }: { params: { id: string } }

4.  Copy in full the add blog page
    Note: removed un-needed things
    image, useform, getAllCategories, file input , location and category , imports image, useform hook,

<!-- Voy ==================================================> -->

5.  create func to get blogs by id

const getBlogById = async (id: string) => {
const res = await fetch('http://localhost:3000/api/blogs/' + id, { cache: 'no-store' });
const data = await res.json()

console.log(data)
return data.blog
} 6. Creta a loading state and set to false
add Toaster , inside the section div

    ```
     <Toaster position="top-right" />
    ```

7.  create a useEffect func
    useEffect(() => {

    setIsLoading(true)
    toast.loading('Updating Blog Details', { id: 'loading' })
    getBlogById(params.id).then((data: BlogItemTypes) => {
    const contentBlocks = convertFromHTML(data.description)
    const contentState = ContentState.createFromBlockArray(contentBlocks.contentBlocks)

        const initialState = EditorState.createWithContent(contentState)
        setEditorState(initialState)

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

8.  full useEffect code

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

9.  Test it , you should be able to see the original content form the blog for the , title an the he Editor

10. create updateBlogFunc

        ```
        const updateBlog = async (id: string, postData: any) => {
          const res = await fetch('http://localhost:3000/api/blogs/' + id, {
            cache: 'no-store',
            method: "PUT", body: JSON.stringify({ ...postData })
          },
          );
          const data = await res.json()

          console.log(data)
          return data.blog
        }
        ```

11. Create a handlePost function to update blgo

const handlePost = async () => {

    console.log(headingRef.current?.innerText)
    console.log(convertEditorDataToHTML())

    const postData = { title: headingRef.current?.innerText, description: convertEditorDataToHTML() }
    try {
      toast.loading('Updating your Post ', { id: 'postData' })
      await (updateBlog(params.id, postData))


      toast.success('Update Completed 😺', { id: 'postData' })

    } catch (error) {
      toast.error('Update failed 😹', { id: 'postData' })
      return console.log(error)
    }

}

12. call the handlePost func when publish button is clicke on
    onClick={handlePost}

13. If you update a blog you should see it update it

14. navigate to updatedd post

import { useRouter } from 'next/navigation'

const router = useRouter()

router.push('/dashboard')

15. once you in the blogs view page you might need to reload it to see update
    due to caching issues with Next 13 - trying to find why since we are using cache no-store

16. Delete Fuctionality
    Go back to BlogItem component

    Create funciton to delete a blog

          const deleteBlog = async (id: string) => {
          const res = await fetch('http://localhost:3000/api/blogs/' + id, {
            cache: 'no-store',
            method: "DELETE",
          },
          );
          const data = await res.json()

          console.log(data)
          return data.blog

    }

17. Create a funciton to handleDelete on click of the delete button

    const handleDelete = async () => {
    toast.loading("Deleting Blog", { id: 'delete' })
    try {
    await deleteBlog(props.id)

            toast.success("Blog Deleted Successfully  ", { id: 'delete' })
          } catch (error) {
            console.log(error)
            toast.error(" Deleting failed   ", { id: 'delete' })
          }

    }

18. You should be able to delete a blog now

Note: notice after delete you can still see page you need to refresh page, working on solution

19. try to conver the Profile to client to see if blogs can be updated on delete

20. converted the Profile page to Client , so that when we add or delete a blog , it reflects automatically

    'use client'

    import Image from 'next/image'
    import { useCallback, useEffect, useState } from 'react'
    import { MdAttachEmail } from 'react-icons/md'
    import UserIcon from '@/public/userIcon.png'

    import BlogItem from '../../components/BlogItem'
    import { BlogItemTypes, UserItemType } from '@/lib/types'

    import { authOptions } from '../../api/auth/[...nextauth]/route'
    import { useSession } from 'next-auth/react'

    const Profile = () => {

        const [currentUserData, setCurrentUserData] = useState(null)





        const { data: session } = useSession()
        // console.log(session.user)

        // const sessionData = await getServerSession(authOptions)

        // const userData = await getUserById(sessionData?.user?.id)
        // console.log(userData.blog)



        // eslint-disable-next-line react-hooks/exhaustive-deps
        const deleteBlog = (async (id: string) => {
          const res = await fetch('http://localhost:3000/api/blogs/' + id, {
            cache: 'no-store',
            method: "DELETE",
          },
          );
          const data = await res.json()

          console.log(data)
          return data.blog
        }
        )

        const getUserDataById = async (id: string) => {

          const res = await fetch('http://localhost:3000/api/users/' + id,
            { cache: 'no-store' }
            // { next: { revalidate: 0 } }
          );

          const data = await res.json()

          setCurrentUserData(data)
        }


        console.log(currentUserData)

        useEffect(() => {
          if (session && session.user) {
            getUserDataById(session.user.id)

          }
        }, [session, deleteBlog])


        return (

          <section className='w-full h-full flex flex-col '>
            <div>
              <Image src={session?.user.image ?? UserIcon} alt='UserProfile ' width={200} height={200} className='h-20 w-20 object-cover mx-auto my-8 rounded-full bg-gray-50 border-4 border-purple-400 ' />
            </div>
            <div className=" mx-auto my-2">
              <h1 className="text-4xl font-semibold  w-fit  rounded-md capitalize">
                {session?.user.name}
              </h1>
            </div>

            <div className=" mx-auto my-2">
              <h1 className="text-xl font-semibold  flex items-center   w-fit gap-1">
                <span> <MdAttachEmail /> </span>             {session?.user.email}
              </h1>
            </div>

            {currentUserData &&
              <div className="w-full h-full flex flex-col">
                <div className='w-2/4 mx-auto'>
                  <p className='text-center font-semibold text-xl  text-gray-50 bg-gray-400 border shadow-lg w-fit mx-auto rounded-md px-2'>🌟 Blogs Count: {currentUserData?._count?.blogs} </p>

                </div>

                <div className="  bg-red-100 flex flex-wrap justy-center p-4 my-3 gap-8">

                  {currentUserData?.blogs?.map((blog: BlogItemTypes) => <BlogItem key={blog.id} {...blog} isProfile={true} deleteBlog={deleteBlog} />)}

                </div>

              </div>

            }


            {/* {JSON.stringify(userData.Blogs)} */}
          </section >
        )

    }

    export default Profile

Note: that we moved the deleteBlog function form the BlogItem, to the profile so that we can add as a dependency on the useEffect, so that on Delete , we can grab the blogs again and show the most up to date informaiton

21. Also on the Blogs / add page , we made it so that once a blog its created we are pushed to the Profile page, to show the newly added blog as part of our list of blogs

Note we used: router.push('/profile')

We did the same on the blogs/ edit page so that upon edit we are redirected to the Profile page to see the new post updated.

22. Now we are able to edit, delete and create blogs, and upon ay of those actions the info is reflected in real time

# 12 Search Page Functionality

1. create a search/ page.tsx export as Search use a client component

```
      ''use client'


      import { useState } from 'react'
      import { FaSearch } from 'react-icons/fa'
      import { useForm } from 'react-hook-form'
      import { BlogItemTypes } from '@/lib/types'
      import { toast } from 'react-hot-toast'
      import BlogItem from '@/app/components/BlogItem'



      const SearchPage = () => {

        const [blogs, setblogs] = useState<BlogItemTypes[]>([])

        const { handleSubmit, register } = useForm()




        const handleSearch = async ({ search }: { search: string }) => {

          let str = search

          // fucntion to  fix blank spaces on search and replace them with %20 that the server can understand
          if (search.includes(' ')) {
            str = search.split(' ').join('%20')
          }

          toast.loading('searching', { id: 'SEARCH' })


          try {
            toast.loading('searching', { id: 'SEARCH' })
            const res = await fetch('http://localhost:3000/api/search?title=' + str, { cache: 'no-store' })
            const data = await res.json()

            setblogs(data.blogs)

            console.log(data.blogs)

            toast.success('Search Completed', { id: 'SEARCH' })
          } catch (error) {
            console.log(error)
            toast.loading('Search Error', { id: 'SEARCH' })
          }



        }




        return (
          <section className='w-full h-full'>
            <h2 className="text-3xl text-center font-bold font-serif my-12">
              Search From The Amazing Blogs
            </h2>
            <div className="flex items-center justify-center  ">
              <div className=" w-2/4 flex items-center justify-between bg-gray-100 my-4 py-4  rounded-l-xl text-slate-900 font-semibold px-4 text-xl shadow ">

                <input type="text" className='bg-transparent border-none outline-none p-1 w-full' placeholder='Ex: fitness'  {...register("search", { required: true })} />


              </div>
              <div
                //@ts-ignore
                onClick={handleSubmit(handleSearch)}
                className=" w-20 flex items-center justify-between bg-slate-400  my-4 py-4 rounded-r-xl text-slate-200 font-semibold px-2 text-lg  hover:bg-purple-400 duration-500  shadow ">
                <button className='bg-transparent border-none outline-none p-1 w-full' placeholder='Ex: fitness' >  <FaSearch size={28} className='rounded-full cursor-pointer mx-auto' />  </button>

              </div>
            </div>

            <div className="flex w-full flex-wrap gap-4 justify-center mt-6">
              {blogs.map((blog) => <BlogItem key={blog.id} {...blog} />)}
            </div>

          </section>
        )
      }

      export default SearchPage
```

export default SearchPage

# 13 Customizing Next-Auth

we will customize next-auth so that when we sign in with socila media , we save the new user in our Database ,

1.  provide client Id and client secret from github and google, then add them to .env file

2.  add them to api / auth / route.ts

    sample

    ```
     GithubProvider({
       clientId: process.env.GITHUB_CLIENT_ID as string,
       clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
     }),
     GoogleProvider({
       clientId: process.env.GOOGLE_CLIENT_ID as string,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
     }),

    ```

3.  try to login , use a diferent email from the ones you register in github or google for the api keys

4.  test it should be able to login in http://localhost:3000/api/auth/signin

5.  add logout button to navbar

```
          {status === 'authenticated' && <button className='bg-violet-500 px-2 rounded text-slate-100 hover:bg-violet-700 font-semibold shadow' onClick={() => signOut({ callbackUrl: 'http://localhost:3000/login' })} >Logout</button>}

```

6.  If user signin with github or google , we need to add him/her to our database

In Helpers we will create this function to create an user if the doesnt exits in our DB

Note code bellow create a new user if one doesnt exist after someone logins with social media accounts

```
export const verifyUsrDetailsAtLogin = async (user: DefaultUser) => {
  await connectToDb();

  const userExistsInDB = await prisma.user.findFirst({ where: { email: user.email as string } })

  if (userExistsInDB) return userExistsInDB

  else {
    const newUser = await prisma.user.create({ data: { email: user.email as string, name: user.name as string } })

    return newUser

  }
}
```

7.  Then If user signin with github or google , we need to add him/her to udr database we will create a callback in api / auth / route

Note after the user signs in with github or google , we dont know if user is in our DB so we need to check with

```

    async signIn({ account, user, profile }) {


      if (account.provider === 'github' || account.provider === 'google') {

        const newUser = await verifyUsrDetailsAtLogin(user)

        if (typeof newUser !== null) {
          user.id = newUser?.id

          if (profile && profile.sub) {
            profile.sub = newUser?.id
          }
        }

      }
      return true
    },

```

8. try to login with social media , you should be able to do it , also if you check your DB your new user (that sign in with social media ) should be there

# 14 Desing custom login and signup pages

1. create login page

```
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
```

2. create register page

```

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
```

3.  in order to use the login page in api/ auth you need to add the pages for signIn, so that we overtate the page to the page we jsut created for login

```

  pages: {
    signIn: '/login',

  }
```

# 15 Optimization

## Next Steps ----------------------------------------------- >>>

        ## Next Steps ----------------------------------------------- >>>

        ## Next Steps ----------------------------------------------- >>>

# 16 add pagination

# 17 add filter by
