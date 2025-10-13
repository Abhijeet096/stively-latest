'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { ArrowLeft, Send, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';

export default function SubmitArticlePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      alert('You must be signed in to submit articles');
      return;
    }

    if (!formData.title.trim() || !content.trim() || content === '<p></p>') {
      alert('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      // Upload cover image if exists
      let coverImageUrl = '';
      if (coverImage) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('file', coverImage);
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: imageFormData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            coverImageUrl = uploadData.url;
          }
        } catch (uploadError) {
          console.warn('Image upload failed, continuing without image:', uploadError);
        }
      }

      const articleData = {
        title: formData.title.trim(),
        slug: generateSlug(formData.title),
        content: content,
        excerpt: formData.excerpt.trim() || content.replace(/<[^>]*>/g, '').substring(0, 200),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        coverImage: coverImageUrl,
        authorName: session.user.name,
        authorEmail: session.user.email,
      };

      const response = await fetch('/api/authors/submit-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit article');
      }

      alert('Article submitted successfully! You will be notified once it is reviewed.');
      router.push('/author');
      
    } catch (error: any) {
      console.error('Submission error:', error);
      alert('Failed to submit article: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to submit articles.</p>
        </div>
      </div>
    );
  }

  const userRole = (session.user as any).role;
  
  if (userRole !== 'author' && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Author Access Required</h1>
          <p className="text-gray-600 mb-4">You need author privileges to submit articles.</p>
          <Link href="/apply-author">
            <Button>Apply to Become an Author</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/author" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Submit New Article</h1>
          <p className="text-gray-600">
            Write your article and submit it for admin review. Once approved, it will be published on the site.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Article Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a compelling article title"
                className="mt-2"
                required
              />
            </div>

            {/* Auto-generated Slug Preview */}
            {formData.title && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">Article URL will be:</Label>
                <p className="text-blue-600 font-mono text-sm mt-1">
                  /blog/{generateSlug(formData.title)}
                </p>
              </div>
            )}

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of your article"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                If left empty, the first 200 characters of your content will be used.
              </p>
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
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="react, javascript, tutorial, beginners"
                className="mt-2"
              />
            </div>

            {/* Cover Image */}
            <div>
              <Label>Cover Image (Optional)</Label>
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

            {/* Content - Advanced Editor */}
            <div>
              <Label>Article Content *</Label>
              <div className="mt-2">
                <TiptapEditor content={content} onChange={setContent} />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Use the rich text editor above to format your article with headings, bold text, images, and more.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
            
            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">ℹ️</div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Review Process</h4>
                  <p className="text-yellow-700 text-sm">
                    Your article will be submitted for admin review. You'll be notified via email once it's approved and published on the site. 
                    You cannot edit articles after submission, so please review carefully before submitting.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}