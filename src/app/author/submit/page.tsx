'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { ArrowLeft, Send, Loader2, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Debounce utility function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function SubmitArticlePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
    customSlug: '', // Add custom slug field
  });
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [slugError, setSlugError] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugValid, setSlugValid] = useState(false);

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

  const getFinalSlug = () => {
    return formData.customSlug.trim() || generateSlug(formData.title);
  };

  // Debounced slug checking
  const checkSlugAvailability = async (slug: string) => {
    if (!slug.trim()) {
      setSlugError('');
      setSlugValid(false);
      return;
    }

    setSlugChecking(true);
    setSlugError('');

    try {
      const response = await fetch('/api/blogs/check-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();

      if (response.ok) {
        setSlugValid(true);
        setSlugError('');
      } else {
        setSlugValid(false);
        setSlugError(data.error);
      }
    } catch (error) {
      setSlugValid(false);
      setSlugError('Failed to check slug availability');
    } finally {
      setSlugChecking(false);
    }
  };

  // Debounce the slug checking
  const debouncedCheckSlug = useMemo(
    () => debounce(checkSlugAvailability, 500),
    []
  );

  useEffect(() => {
    const finalSlug = getFinalSlug();
    if (finalSlug) {
      debouncedCheckSlug(finalSlug);
    }
  }, [formData.customSlug, formData.title, debouncedCheckSlug]);

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

    // Check if slug is valid
    const finalSlug = getFinalSlug();
    if (slugError || (!slugValid && finalSlug !== generateSlug(formData.title))) {
      alert('Please ensure the URL slug is valid and available');
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
        slug: getFinalSlug(),
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/author" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Submit New Article</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Write your article and submit it for admin review. Once approved, it will be published on the site.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

            {/* Custom URL Slug */}
            <div>
              <Label htmlFor="customSlug">Custom URL Slug (Optional)</Label>
              <div className="relative mt-2">
                <Input
                  id="customSlug"
                  value={formData.customSlug}
                  onChange={(e) => setFormData({ ...formData, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="custom-article-url"
                  className={`pr-10 ${slugError ? 'border-red-300 focus:border-red-500' : slugValid ? 'border-green-300 focus:border-green-500' : ''}`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {slugChecking ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : slugValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : slugError ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : null}
                </div>
              </div>
              {slugError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {slugError}
                </p>
              )}
              {slugValid && !slugError && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  URL slug is available!
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to auto-generate from title. Only use lowercase letters, numbers, and hyphens.
              </p>
            </div>

            {/* Auto-generated Slug Preview */}
            {formData.title && (
              <div className={`p-3 rounded-lg border ${slugError ? 'bg-red-50 border-red-200' : slugValid ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <Label className="text-sm font-medium text-blue-800">Article URL will be:</Label>
                <p className={`text-sm mt-1 font-mono ${slugError ? 'text-red-700' : slugValid ? 'text-green-700' : 'text-blue-700'}`}>
                  /blog/{getFinalSlug()}
                </p>
                {formData.customSlug && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using custom slug: "{formData.customSlug}"
                  </p>
                )}
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
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto"
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