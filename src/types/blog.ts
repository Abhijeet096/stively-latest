// Just for reference - the featured field will be added
interface Blog {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published';
  featured: boolean; // NEW FIELD
  author: object;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked this blog
}