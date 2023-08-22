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






## Next Steps ---------------------------------------   >>> 
## Next Steps ---------------------------------------   >>> 
## Next Steps ---------------------------------------   >>> 
  
## 2 Next-auth
## 3 Api Design 
## 4 Blogs Api  Upload image
## 5 Frontend
## 6 Homepage
## 7 Blogs Page
## 8 RichText Editor
## 9 View Page 
## 10 Profile Page
## 11 Edit + Delete Functionality 
## 12 Search Page Functionality
## 13 Login + Signup pages
## 14 Optimization 