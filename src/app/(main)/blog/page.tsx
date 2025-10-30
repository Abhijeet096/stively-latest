"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Footer from "@/components/Footer";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  views: number;
  likes: number;
  createdAt: string;
}

export default function BlogListingPage() {
  const { data: session, status } = useSession();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?status=published");
      const data = await response.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Stively
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/blog">
              <Button variant="ghost">Articles</Button>
            </Link>
            {status === "authenticated" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            ) : status === "loading" ? (
              <div className="text-sm text-gray-600">Checking session…</div>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Explore Our Articles</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Discover curated stories across technology, lifestyle, business, and more
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-3 flex-wrap">
          <Badge className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2">
            All
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-purple-50 px-4 py-2">
            Technology
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-purple-50 px-4 py-2">
            Lifestyle
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-purple-50 px-4 py-2">
            Business
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-purple-50 px-4 py-2">
            Travel
          </Badge>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-3xl font-bold mb-2 text-slate-700">No Articles Yet</h3>
            <p className="text-slate-500 mb-6 text-lg">
              The admin hasn't published any articles yet. Check back soon!
            </p>
            <Link href="/">
              <Button variant="outline" size="lg">← Back to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blog/${blog.slug}`}>
                <Card className="premium-card overflow-hidden group cursor-pointer h-full">
                  <img
                    src={blog.coverImage || '/placeholder-image.jpg'}
                    alt={blog.title}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{blog.category}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {blog.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-4">
                        <span>👁️ {blog.views}</span>
                        <span>❤️ {blog.likes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}