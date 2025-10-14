import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import clientPromise from "@/lib/db/mongodb";
import { Metadata } from "next";
import BlogInteractions from "./BlogInteractions";
import BlogImage from "./BlogImage";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
  };
  views: number;
  likes: number;
  createdAt: string;
}

interface PageProps {
  params: { slug: string };
}

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const client = await clientPromise;
    const db = client.db("blog-platform");
    
    const blog = await db.collection("blogs").findOne({ 
      slug: slug,
      status: "published"
    });

    if (!blog) return null;

    // Update view count
    await db.collection("blogs").updateOne(
      { _id: blog._id },
      { $inc: { views: 1 } }
    );

    return {
      _id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      category: blog.category,
      tags: blog.tags || [],
      author: blog.author,
      views: blog.views + 1,
      likes: blog.likes,
      createdAt: blog.createdAt
    };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const client = await clientPromise;
    const db = client.db("blog-platform");
    
    const blogs = await db.collection("blogs")
      .find({ status: "published" })
      .project({ slug: 1 })
      .toArray();
    
    return blogs.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  
  if (!blog) {
    return {
      title: "Article Not Found | Stively",
      description: "The article you're looking for could not be found."
    };
  }

  return {
    title: `${blog.title} | Stively`,
    description: blog.excerpt || blog.content.replace(/<[^>]*>/g, "").substring(0, 160),
    keywords: blog.tags.join(", "),
    authors: [{ name: blog.author.name }],
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.content.replace(/<[^>]*>/g, "").substring(0, 160),
      type: "article",
      url: `https://stively.com/blog/${blog.slug}`,
      images: blog.coverImage ? [
        {
          url: blog.coverImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt || blog.content.replace(/<[^>]*>/g, "").substring(0, 160),
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
          >
            ← Back to Articles
          </Link>
          
          <div className="mb-6">
            <Badge className="mb-4">{blog.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-6">
              <span>By {blog.author.name}</span>
              <span className="mx-3">•</span>
              <span>{formatDate(blog.createdAt)}</span>
              <span className="mx-3">•</span>
              <span>{blog.views.toLocaleString()} views</span>
            </div>
          </div>

          {blog.coverImage && (
            <div className="mb-8">
              <BlogImage
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          
          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Elements */}
          <BlogInteractions
            blogId={blog._id}
            slug={blog.slug}
            initialLikes={blog.likes}
            title={blog.title}
          />
        </div>
      </div>
    </div>
  );
}