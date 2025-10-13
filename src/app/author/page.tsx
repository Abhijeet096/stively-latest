'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Clock, CheckCircle } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  feedback?: string;
}

export default function AuthorDashboard() {
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadArticles();
    }
  }, [session]);

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/authors/submit-article');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.submissions || []);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Author Dashboard</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your author dashboard and manage your articles.</p>
          <Link href="/auth/signin?callbackUrl=/author">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Sign In to Author Dashboard
            </Button>
          </Link>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Don't have an account? <Link href="/apply-author" className="text-purple-600 hover:underline">Apply to become an author</Link>
            </p>
          </div>
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
          <p className="text-gray-600 mb-4">You need author privileges to access this page.</p>
          <Link href="/apply-author">
            <Button>Apply to Become an Author</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Author Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session.user?.name}! Manage your article submissions here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/author/submit">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white hover:from-purple-700 hover:to-blue-700 transition-all cursor-pointer">
              <PlusCircle className="w-12 h-12 mb-4" />
              <h2 className="text-xl font-bold mb-2">Submit New Article</h2>
              <p className="text-purple-100">
                Write and submit a new article for review by the admin team.
              </p>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Your Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Submissions:</span>
                <span className="font-semibold">{articles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Approved:</span>
                <span className="font-semibold text-green-600">
                  {articles.filter(a => a.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-600">
                  {articles.filter(a => a.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Your Articles</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Articles Yet</h3>
              <p className="text-gray-500 mb-6">
                Start by submitting your first article for review.
              </p>
              <Link href="/author/submit">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Submit Your First Article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Submitted {new Date(article.submittedAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          {article.status === 'pending' && (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-600">Pending Review</span>
                            </>
                          )}
                          {article.status === 'approved' && (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">Approved</span>
                            </>
                          )}
                          {article.status === 'rejected' && (
                            <>
                              <FileText className="w-4 h-4 text-red-500" />
                              <span className="text-red-600">Needs Revision</span>
                            </>
                          )}
                        </div>
                      </div>
                      {article.feedback && (
                        <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-300 text-sm">
                          <p className="font-medium text-yellow-800">Feedback:</p>
                          <p className="text-yellow-700">{article.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}