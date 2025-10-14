'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, File, CheckCircle, X, Loader2 } from 'lucide-react';
import TiptapEditor from '@/components/editor/TiptapEditor';

interface ImportedDocument {
  title: string;
  content: string;
  excerpt: string;
  images: string[];
}

export default function ImportDocumentPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<ImportedDocument | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
    featured: false,
  });
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.docx') || fileName.endsWith('.pdf')) {
        setFile(selectedFile);
      } else {
        alert('Please select a .docx or .pdf file');
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Starting file upload...');
      console.log('File:', file.name, file.size, file.type);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      console.log('🔵 FormData created, sending request...');

      const response = await fetch('/api/admin/import-document', {
        method: 'POST',
        body: uploadFormData,
        // Don't set Content-Type header, let the browser set it with boundary
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response:', responseText);
        
        try {
          const error = JSON.parse(responseText);
          throw new Error(error.error || 'Import failed');
        } catch {
          throw new Error(`Server error: ${response.status} - ${responseText}`);
        }
      }

      const responseText = await response.text();
      console.log('Success response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', responseText);
        throw new Error('Invalid server response');
      }
      const doc = data.document;

      setImported(doc);
      setFormData(prevFormData => ({
        ...prevFormData,
        title: doc.title,
        slug: generateSlug(doc.title),
        excerpt: doc.excerpt,
      }));
      setContent(doc.content);

      alert('Document imported successfully! Review and publish below.');
    } catch (error: any) {
      alert(error.message || 'Failed to import document');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePublish = async () => {
    if (!formData.title || !content) {
      alert('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      // Upload cover image if exists
      let coverImageUrl = '';
      if (coverImage) {
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
      }

      // Create article
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content,
          coverImage: coverImageUrl,
          status: 'published',
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error('Failed to publish article');

      alert('Article published successfully!');
      router.push('/admin');
    } catch (error) {
      alert('Failed to publish article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Document</h1>
          <p className="text-gray-600">
            Upload Word (.docx) or PDF files to import as blog posts
          </p>
        </div>

        {!imported ? (
          /* Upload Section */
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="mb-6">
                <FileText size={64} className="mx-auto text-purple-600 mb-4" />
                <h2 className="text-xl font-bold mb-2">Upload Document</h2>
                <p className="text-gray-600">
                  Import Word documents with images, tables, and formatting
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Word (.docx) or PDF files
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".docx,.pdf"
                    onChange={handleFileChange}
                  />
                </label>

                {file && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <File className="text-purple-600" size={20} />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={20} />
                      Import Document
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 mb-2" size={24} />
                  <h3 className="font-semibold text-sm mb-1">Images</h3>
                  <p className="text-xs text-gray-600">
                    Automatically extracted and uploaded
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="text-blue-600 mb-2" size={24} />
                  <h3 className="font-semibold text-sm mb-1">Tables</h3>
                  <p className="text-xs text-gray-600">
                    Preserved with formatting
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="text-purple-600 mb-2" size={24} />
                  <h3 className="font-semibold text-sm mb-1">Formatting</h3>
                  <p className="text-xs text-gray-600">
                    Bold, italic, headings maintained
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit and Publish Section */
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold">Document Imported Successfully!</p>
                <p className="text-sm text-gray-600">
                  {imported.images.length} images extracted • Review and publish
                  below
                </p>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <Label>Cover Image (Optional)</Label>
              <div className="mt-2">
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover"
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
                    <span className="text-sm text-gray-500">
                      Upload cover image
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="mt-2"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="mt-2"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="mt-2 w-full px-3 py-2 border rounded-md"
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
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="tag1, tag2, tag3"
                className="mt-2"
              />
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-5 h-5 text-purple-600 rounded"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                ⭐ Mark as Featured Article
              </Label>
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
                onClick={() => {
                  setImported(null);
                  setFile(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Import Another
              </Button>
              <Button
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Publishing...
                  </>
                ) : (
                  'Publish Article'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}