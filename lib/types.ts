
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
  _count: { Blogs: number };
  message: string
}
