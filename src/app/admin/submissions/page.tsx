'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';

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
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

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

  const handleReject = async (submissionId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessing(submissionId);
    try {
      const response = await fetch('/api/admin/submissions/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, feedback: reason }),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Review Submissions</h1>
          <p className="text-gray-600 mt-1">
            Review and manage author article submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{submission.title}</CardTitle>
                      {getStatusBadge(submission.status)}
                    </div>
                    <CardDescription className="text-base">
                      {submission.excerpt || 'No excerpt provided'}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>By: {submission.author.name}</span>
                      <span>•</span>
                      <span>Category: {submission.category}</span>
                      <span>•</span>
                      <span>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
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

                {/* Actions */}
                {submission.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(submission._id)}
                      disabled={processing === submission._id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processing === submission._id ? 'Processing...' : 'Approve & Publish'}
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(submission._id)}
                      disabled={processing === submission._id}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
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
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Full Article
                    </Button>
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