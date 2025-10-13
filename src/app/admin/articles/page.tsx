"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  views: number;
  likes: number;
  category: string;
  createdAt: string;
  featured?: boolean;
}

export default function AdminArticlesPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchBlogs();
  }, [filter]);

  async function fetchBlogs() {
    try {
      const url = filter === "all" 
        ? "/api/blogs" 
        : `/api/blogs?status=${filter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(blogId: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Article deleted successfully");
        fetchBlogs(); // Refresh list
      } else {
        toast.error("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete article");
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading articles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Articles</h1>
          <p className="text-muted-foreground">
            Manage your published and draft articles
          </p>
        </div>
        <Link href="/admin/editor/new">
          <Button>✍️ New Article</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({blogs.length})
        </Button>
        <Button
          variant={filter === "published" ? "default" : "outline"}
          onClick={() => setFilter("published")}
        >
          Published
        </Button>
        <Button
          variant={filter === "draft" ? "default" : "outline"}
          onClick={() => setFilter("draft")}
        >
          Drafts
        </Button>
      </div>

      {/* Articles List */}
      {blogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No articles found. Create your first article!
            </p>
            <Link href="/admin/editor/new">
              <Button>✍️ Create Article</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <Card key={blog._id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                        {blog.status}
                      </Badge>
                      <Badge variant="outline">{blog.category}</Badge>
                      {blog.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{blog.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(blog.createdAt)} • {blog.views} views • {blog.likes} likes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/editor/${blog._id}`}>
                      <Button variant="outline" size="sm">
                        ✏️ Edit
                      </Button>
                    </Link>
                    <Link href={`/blog/${blog.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        👁️ View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(blog._id)}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}