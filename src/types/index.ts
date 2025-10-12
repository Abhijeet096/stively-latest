export interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: Date;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  author: {
    id: string;
    name: string;
  };
  tags: string[];
  category: string;
  status: "draft" | "published";
  views: number;
  likes: number;
  likedBy: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalViews: number;
  totalLikes: number;
}

export interface CreateBlogInput {
  title: string;
  description: string;
  content: string;
  coverImage: string;
  tags: string[];
  category: string;
  status: "draft" | "published";
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}