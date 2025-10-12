"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-purple-100 text-lg mb-6">
          Manage your articles, view analytics, and publish amazing content.
        </p>
        <Link href="/admin/editor/new">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
            ✍️ Create New Article
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardDescription>Total Articles</CardDescription>
            <CardTitle className="text-4xl">{stats.totalArticles}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All articles in your platform
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-4xl text-green-600">
              {stats.publishedArticles}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Live articles visible to users
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-4xl text-yellow-600">
              {stats.draftArticles}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Unpublished drafts
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-4xl text-purple-600">
              {stats.totalViews.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total article views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/editor/new">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <span className="text-3xl">✍️</span>
              <span>Write New Article</span>
            </Button>
          </Link>
          <Link href="/admin/articles">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <span className="text-3xl">📚</span>
              <span>Manage Articles</span>
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <span className="text-3xl">📈</span>
              <span>View Analytics</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}