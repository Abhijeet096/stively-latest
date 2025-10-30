'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Clock, CheckCircle, TrendingUp, Award, Target, Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Author Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome back, {session.user?.name}! Manage your article submissions here.
          </p>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{articles.length}</p>
              </div>
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">Active writer</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {articles.filter(a => a.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs sm:text-sm">
              <Award className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-yellow-600">Approved articles</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {articles.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-xs sm:text-sm">
              <Activity className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-blue-600">Under review</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {articles.length > 0
                    ? Math.round((articles.filter(a => a.status === 'approved').length / articles.length) * 100)
                    : 0
                  }%
                </p>
              </div>
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">Approval rate</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link href="/author/submit">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 rounded-xl p-4 sm:p-6 text-white hover:from-purple-700 hover:via-purple-800 hover:to-blue-800 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <PlusCircle className="w-8 h-8 sm:w-12 sm:h-12" />
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">Submit New Article</h2>
              <p className="text-purple-100 text-sm sm:text-base opacity-90">
                Write and submit a new article for review by the admin team.
              </p>
              <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-purple-200">
                <span>Get published today</span>
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                Stats
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">Your Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm sm:text-base">Total Submissions</span>
                <span className="font-bold text-lg text-gray-900">{articles.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-green-600 text-sm sm:text-base flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approved
                </span>
                <span className="font-bold text-lg text-green-600">
                  {articles.filter(a => a.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-yellow-600 text-sm sm:text-base flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending
                </span>
                <span className="font-bold text-lg text-yellow-600">
                  {articles.filter(a => a.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Articles</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-gray-500">Live updates</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-6 sm:py-8">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Articles Yet</h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
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
            <div className="space-y-3 sm:space-y-4">
              {articles.map((article, index) => (
                <div key={article._id} className="group border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md hover:border-purple-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg mb-1 truncate group-hover:text-purple-700 transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              Submitted {new Date(article.submittedAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1">
                              {article.status === 'pending' && (
                                <>
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                  <span className="text-yellow-600 font-medium">Pending Review</span>
                                </>
                              )}
                              {article.status === 'approved' && (
                                <>
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-green-600 font-medium">Approved & Published</span>
                                </>
                              )}
                              {article.status === 'rejected' && (
                                <>
                                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                  <span className="text-red-600 font-medium">Needs Revision</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {article.feedback && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 text-xs sm:text-sm rounded-r-lg">
                          <div className="flex items-start gap-2">
                            <div className="text-yellow-600 mt-0.5">💬</div>
                            <div>
                              <p className="font-medium text-yellow-800 mb-1">Feedback from Admin:</p>
                              <p className="text-yellow-700">{article.feedback}</p>
                            </div>
                          </div>
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