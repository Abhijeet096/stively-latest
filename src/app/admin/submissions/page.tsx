'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, Eye, Edit, Save, Loader2, AlertCircle } from 'lucide-react';

interface Submission {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  content: string;
  tags: string[];
  slug?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Submission>>({});
  const [slugError, setSlugError] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugValid, setSlugValid] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    setProcessing(submissionId);
    try {
      const response = await fetch('/api/admin/submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      if (response.ok) {
        alert('Submission approved and published!');
        fetchSubmissions(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve submission');
    } finally {
      setProcessing(null);
    }
  };

  const handleEdit = (submission: Submission) => {
    setEditingId(submission._id);
    setEditData({
      title: submission.title,
      excerpt: submission.excerpt,
      content: submission.content,
      category: submission.category,
      tags: submission.tags,
    });
    setSlugError('');
    setSlugValid(false);
  };

  const checkSlugAvailability = async (slug: string, excludeId?: string) => {
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

  const handleSaveEdit = async (submissionId: string) => {
    setProcessing(submissionId);
    try {
      const response = await fetch('/api/admin/submissions/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, ...editData }),
      });

      if (response.ok) {
        alert('Submission updated successfully!');
        setEditingId(null);
        setEditData({});
        fetchSubmissions();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission');
    } finally {
      setProcessing(null);
    }
  };

  const handlePublishEdited = async (submissionId: string) => {
    setProcessing(submissionId);
    try {
      // First save any edits
      if (editingId === submissionId) {
        await handleSaveEdit(submissionId);
      }

      // Then publish
      const response = await fetch('/api/admin/submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      if (response.ok) {
        alert('Submission edited and published successfully!');
        setEditingId(null);
        setEditData({});
        fetchSubmissions();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error publishing submission:', error);
      alert('Failed to publish submission');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessing(submissionId);
    try {
      const response = await fetch('/api/admin/submissions/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, reviewNotes: reason }),
      });

      if (response.ok) {
        alert('Submission sent back for revision');
        fetchSubmissions(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject submission');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Review Submissions</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Review and manage author article submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            {submissions.filter(s => s.status === 'pending').length} pending
          </span>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Edit className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
            <p className="text-gray-600">
              When authors submit articles for review, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <CardTitle className="text-lg sm:text-xl truncate">{submission.title}</CardTitle>
                      {getStatusBadge(submission.status)}
                    </div>
                    <CardDescription className="text-sm sm:text-base">
                      {submission.excerpt || 'No excerpt provided'}
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                      <span>By: {submission.author.name}</span>
                      <span>•</span>
                      <span>Category: {submission.category}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Tags */}
                {submission.tags && submission.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {submission.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Content Preview */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    {submission.content ? submission.content.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : 'No content available'}
                  </p>
                </div>

                {/* Edit Form */}
                {editingId === submission._id && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Edit Submission</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={editData.title || ''}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">URL Slug</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={editData.slug || submission.slug || ''}
                            onChange={(e) => {
                              const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                              setEditData({ ...editData, slug: newSlug });
                              checkSlugAvailability(newSlug, submission._id);
                            }}
                            className={`w-full px-3 py-2 pr-10 border rounded-md text-sm ${
                              slugError ? 'border-red-300' : slugValid ? 'border-green-300' : ''
                            }`}
                            placeholder="url-slug-here"
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
                          <p className="text-xs text-red-600 mt-1">{slugError}</p>
                        )}
                        {slugValid && (
                          <p className="text-xs text-green-600 mt-1">Slug is available!</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Excerpt</label>
                        <textarea
                          value={editData.excerpt || ''}
                          onChange={(e) => setEditData({ ...editData, excerpt: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Category</label>
                        <select
                          value={editData.category || submission.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
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
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={editData.tags?.join(', ') || ''}
                          onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handlePublishEdited(submission._id)}
                        disabled={processing === submission._id || !!slugError}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {processing === submission._id ? 'Publishing...' : 'Save & Publish'}
                      </Button>
                      <Button
                        onClick={() => handleSaveEdit(submission._id)}
                        disabled={processing === submission._id || !!slugError}
                        variant="outline"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {processing === submission._id ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                          setSlugError('');
                          setSlugValid(false);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {submission.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleApprove(submission._id)}
                        disabled={processing === submission._id}
                        className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processing === submission._id ? 'Processing...' : 'Approve & Publish'}
                      </Button>
                      
                      <Button
                        onClick={() => handleEdit(submission)}
                        disabled={processing === submission._id}
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 text-sm sm:text-base"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit & Publish
                      </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleReject(submission._id)}
                        disabled={processing === submission._id}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 text-sm sm:text-base"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Send for Revision
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          // Open full content in modal or new tab
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>${submission.title}</title></head>
                                <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                                  <h1>${submission.title}</h1>
                                  <div>${submission.content}</div>
                                </body>
                              </html>
                            `);
                          }
                        }}
                        className="text-sm sm:text-base"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                )}

                {submission.status !== 'pending' && (
                  <div className="text-sm text-gray-500 italic">
                    This submission has been {submission.status}.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}