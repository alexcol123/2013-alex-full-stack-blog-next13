import { FunctionBody } from "typescript";

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
  isProfile?: boolean;
  deleteBlog: (id:string)=> void
    
  
}


export type UserItemType = {
  id: string,
  name: string;
  email: string;
  blogs: BlogItemTypes[];
  _count: { blogs: number };
  message: string
}
