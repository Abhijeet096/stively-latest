'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Eye, 
  FilePlus,
  Users,
  CheckSquare,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalArticles: number;
  published: number;
  drafts: number;
  totalViews: number;
  pendingAuthors: number;
  pendingSubmissions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    published: 0,
    drafts: 0,
    totalViews: 0,
    pendingAuthors: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();

      setStats({
        totalArticles: data.totalArticles || 0,
        published: data.published || data.publishedArticles || 0,
        drafts: data.drafts || data.draftArticles || 0,
        totalViews: data.totalViews || 0,
        pendingAuthors: data.pendingAuthors || 0,
        pendingSubmissions: data.pendingSubmissions || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back! 👋</h1>
          <p className="text-purple-100 mb-6">
            Manage your articles, view analytics, and publish amazing content.
          </p>
          <Link href="/admin/editor/new">
            <Button className="bg-white text-purple-600 hover:bg-purple-50">
              ✍️ Create New Article
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Articles */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Articles</span>
              <FileText className="text-blue-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalArticles}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              All articles in your platform
            </p>
          </div>

          {/* Published */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Published</span>
              <CheckSquare className="text-green-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.published}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Live articles visible to users
            </p>
          </div>

          {/* Drafts */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Drafts</span>
              <FilePlus className="text-yellow-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.drafts}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Unpublished drafts
            </p>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Views</span>
              <Eye className="text-purple-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Total article views
            </p>
          </div>

          {/* Pending Authors */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending Authors</span>
              <Users className="text-orange-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.pendingAuthors}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Applications awaiting review
            </p>
            {stats.pendingAuthors > 0 && (
              <Link href="/admin/authors">
                <Button size="sm" variant="outline" className="mt-3">
                  Review Now →
                </Button>
              </Link>
            )}
          </div>

          {/* Pending Submissions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending Submissions</span>
              <Clock className="text-pink-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.pendingSubmissions}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Articles awaiting approval
            </p>
            {stats.pendingSubmissions > 0 && (
              <Link href="/admin/submissions">
                <Button size="sm" variant="outline" className="mt-3">
                  Review Now →
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <p className="text-gray-600 mb-6">Common tasks you might want to do</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/editor/new">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                <div className="text-4xl mb-3">✍️</div>
                <h3 className="font-semibold mb-1">Write New Article</h3>
                <p className="text-sm text-gray-500">Create and publish content</p>
              </div>
            </Link>

            <Link href="/admin/articles">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold mb-1">Manage Articles</h3>
                <p className="text-sm text-gray-500">Edit and organize posts</p>
              </div>
            </Link>

            <Link href="/admin/analytics">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold mb-1">View Analytics</h3>
                <p className="text-sm text-gray-500">Track performance</p>
              </div>
            </Link>

            <Link href="/admin/authors">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-semibold mb-1">Manage Authors</h3>
                <p className="text-sm text-gray-500">Review applications</p>
                {stats.pendingAuthors > 0 && (
                  <span className="inline-block mt-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                    {stats.pendingAuthors} pending
                  </span>
                )}
              </div>
            </Link>

            <Link href="/admin/submissions">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-500 hover:bg-pink-50 transition-all cursor-pointer">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold mb-1">Review Submissions</h3>
                <p className="text-sm text-gray-500">Approve author articles</p>
                {stats.pendingSubmissions > 0 && (
                  <span className="inline-block mt-2 text-xs bg-pink-500 text-white px-2 py-1 rounded-full">
                    {stats.pendingSubmissions} pending
                  </span>
                )}
              </div>
            </Link>

            <Link href="/admin/newsletter">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                <div className="text-4xl mb-3">📧</div>
                <h3 className="font-semibold mb-1">Newsletter</h3>
                <p className="text-sm text-gray-500">Manage subscribers</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}