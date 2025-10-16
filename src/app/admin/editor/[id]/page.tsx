"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TextareaProps } from "@/components/ui/textarea";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    coverImage: "",
    category: "",
    tags: "",
    status: "draft" as "draft" | "published",
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: ""
    }
  });

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  async function fetchBlog() {
    try {
      const res = await fetch(`/api/blogs/${blogId}`);
      if (res.ok) {
        const blog = await res.json();
        setFormData({
          title: blog.title,
          slug: blog.slug || "",
          description: blog.description,
          content: blog.content,
          coverImage: blog.coverImage,
          category: blog.category,
          tags: blog.tags.join(", "),
          status: blog.status,
          seo: {
            metaTitle: blog.seo?.metaTitle || "",
            metaDescription: blog.seo?.metaDescription || "",
            keywords: blog.seo?.keywords?.join(", ") || ""
          }
        });
      } else {
        toast.error("Failed to load article");
        router.push("/admin/articles");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(status: "draft" | "published") {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    if (!formData.slug || !formData.slug.trim()) {
      toast.error("URL slug is required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status,
          tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
          seo: {
            ...formData.seo,
            keywords: formData.seo.keywords.split(",").map(k => k.trim()).filter(Boolean)
          }
        }),
      });

      if (res.ok) {
        toast.success(status === "published" ? "Article updated and published!" : "Changes saved as draft");
        router.push("/admin/articles");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update article");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update article");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading article...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Article</h1>
        <p className="text-muted-foreground">Update your article content and settings</p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL Slug *</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
              placeholder="blog-url-slug"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be the URL: /blog/{formData.slug || 'your-slug'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your article"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Technology, Lifestyle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ai, tools, productivity"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <Input
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Content *</CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
          />
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Meta Title</label>
            <Input
              value={formData.seo.metaTitle}
              onChange={(e) => setFormData({ 
                ...formData, 
                seo: { ...formData.seo, metaTitle: e.target.value }
              })}
              placeholder="SEO-optimized title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <Textarea
              value={formData.seo.metaDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ 
                ...formData, 
                seo: { ...formData.seo, metaDescription: e.target.value }
              })}
              placeholder="SEO description (150-160 characters)"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
            <Input
              value={formData.seo.keywords}
              onChange={(e) => setFormData({ 
                ...formData, 
                seo: { ...formData.seo, keywords: e.target.value }
              })}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/articles")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit("draft")}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          onClick={() => handleSubmit("published")}
          disabled={saving}
        >
          {saving ? "Publishing..." : "Update & Publish"}
        </Button>
      </div>
    </div>
  );
}