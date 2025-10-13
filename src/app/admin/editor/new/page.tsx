'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, Eye, Loader2 } from 'lucide-react';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
    status: 'draft',
    featured: false,
  });
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    console.log('🚀 Starting submission...');
    console.log('Status:', status);
    console.log('Form data:', formData);
    console.log('Content length:', content.length);

    // Validation
    if (!formData.title || !formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!content || content.trim() === '' || content === '<p></p>') {
      alert('Content is required');
      return;
    }

    if (!formData.category) {
      alert('Category is required');
      return;
    }

    setLoading(true);

    try {
      // Upload cover image if exists
      let coverImageUrl = '';
      if (coverImage) {
        console.log('📤 Uploading image...');
        const imageFormData = new FormData();
        imageFormData.append('file', coverImage);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          console.error('Image upload error:', errorData);
          throw new Error('Failed to upload image: ' + (errorData.error || 'Unknown error'));
        }
        
        const uploadData = await uploadRes.json();
        coverImageUrl = uploadData.url;
        console.log('✅ Image uploaded:', coverImageUrl);
      }

      // Prepare article data
      const articleData = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || generateSlug(formData.title),
        content: content,
        excerpt: formData.excerpt.trim() || content.replace(/<[^>]*>/g, '').substring(0, 200),
        coverImage: coverImageUrl,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: status,
        featured: formData.featured,
      };

      console.log('📝 Article data:', articleData);

      // Create article
      console.log('📤 Sending to API...');
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to create article');
      }

      const data = await response.json();
      console.log('✅ Article created:', data);
      
      alert(
        status === 'published' 
          ? `Article published${formData.featured ? ' as Featured' : ''}!` 
          : 'Draft saved!'
      );
      
      router.push('/admin');
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Failed to save article: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Article</h1>
          <p className="text-gray-600">Write and publish your article</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Cover Image */}
          <div>
            <Label>Cover Image</Label>
            <div className="mt-2">
              {coverImagePreview ? (
                <div className="relative">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImagePreview('');
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload cover image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter article title"
              className="mt-2"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="article-url-slug"
              className="mt-2"
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt (Optional)</Label>
            <Input
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief description"
              className="mt-2"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-2 w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Travel">Travel</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="react, javascript, tutorial"
              className="mt-2"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <div>
              <Label htmlFor="featured" className="text-base font-semibold cursor-pointer">
                ⭐ Mark as Featured Article
              </Label>
              <p className="text-sm text-gray-600">
                Featured articles appear in the Featured section on the homepage
              </p>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <Label>Content *</Label>
            <div className="mt-2">
              <TiptapEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              <Save className="mr-2" size={20} />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Eye className="mr-2" size={20} />
              {formData.featured ? 'Publish as Featured' : 'Publish Article'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}