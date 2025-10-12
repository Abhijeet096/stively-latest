"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TiptapEditor from "@/components/editor/TiptapEditor";
import toast from "react-hot-toast";

const CATEGORIES = ["Technology", "Lifestyle", "Business", "Travel", "Health", "Food"];

export default function NewArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "Technology",
    tags: [] as string[],
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [] as string[],
    },
  });

  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        seo: {
          ...formData.seo,
          keywords: [...formData.seo.keywords, keywordInput.trim()],
        },
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      seo: {
        ...formData.seo,
        keywords: formData.seo.keywords.filter((k) => k !== keyword),
      },
    });
  };

  const handleSubmit = async (status: "draft" | "published") => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!coverImage) {
      toast.error("Cover image is required");
      return;
    }

    setIsLoading(true);

    try {
      // Upload cover image first
      const imageFormData = new FormData();
      imageFormData.append("file", coverImage);

      const imageResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      });

      if (!imageResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { url: coverImageUrl } = await imageResponse.json();

      // Create article
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          coverImage: coverImageUrl,
          status,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        // Try to parse JSON error if present
        let errMsg = "Failed to create article";
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      toast.success(
        status === "published"
          ? "Article published successfully!"
          : "Article saved as draft!"
      );
      router.push("/admin/articles");
    } catch (error: any) {
      console.error("Error creating article:", error);
      toast.error(error?.message || "Failed to create article");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Article</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={isLoading}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit("published")}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isLoading ? "Publishing..." : "Publish Article"}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Article Title *
            </label>
            <Input
              placeholder="Enter article title..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Short Description *
            </label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="Brief description of your article..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Category *
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Cover Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
            />
            {coverImagePreview && (
              <img
                src={coverImagePreview}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded-lg"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Article Content *</CardTitle>
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
            <label className="text-sm font-medium mb-2 block">
              Meta Title
            </label>
            <Input
              placeholder="SEO title for search engines..."
              value={formData.seo.metaTitle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, metaTitle: e.target.value },
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.seo.metaTitle.length}/60 characters
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Meta Description
            </label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 border rounded-md"
              placeholder="SEO description for search engines..."
              value={formData.seo.metaDescription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, metaDescription: e.target.value },
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.seo.metaDescription.length}/160 characters
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Focus Keywords
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a keyword..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addKeyword())
                }
              />
              <Button type="button" onClick={addKeyword}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.seo.keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeKeyword(keyword)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}