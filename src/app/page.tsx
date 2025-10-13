import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, BookOpen, Users } from "lucide-react";
import FooterNewsletter from "@/components/FooterNewsletter";
import WelcomePopup from "@/components/WelcomePopup";
import clientPromise from "@/lib/db/mongodb";
import FeaturedArticleCard from "@/components/FeaturedArticleCard";

async function getFeaturedArticles() {
  try {
    const client = await clientPromise;
    const db = client.db('blog-platform');
    
    const articles = await db
      .collection('blogs')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    return articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      excerpt: article.excerpt || article.content.substring(0, 150) + '...',
      slug: article.slug,
      category: article.category || 'Technology',
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      readTime: article.readTime || '5 min read',
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

async function getLatestArticles() {
  try {
    const client = await clientPromise;
    const db = client.db('blog-platform');
    
    const articles = await db
      .collection('blogs')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    return articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      excerpt: article.excerpt || article.content.substring(0, 150) + '...',
      slug: article.slug,
      category: article.category || 'Technology',
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      readTime: article.readTime || '5 min read',
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export default async function Home() {
  const featuredArticles = await getFeaturedArticles();
  const latestArticles = await getLatestArticles();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-600 text-white px-4 py-2">
              ✨ Welcome to Stively
            </Badge>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Discover Stories That Inspire
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Your destination for insightful articles, expert analysis, and compelling stories across technology, lifestyle, and more.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/blog">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Explore Articles <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="#featured">
                <Button size="lg" variant="outline">
                  Featured Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <BookOpen className="text-purple-600" size={48} />
              </div>
              <h3 className="text-4xl font-bold mb-2">500+</h3>
              <p className="text-slate-600">Published Articles</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Users className="text-blue-600" size={48} />
              </div>
              <h3 className="text-4xl font-bold mb-2">50K+</h3>
              <p className="text-slate-600">Active Readers</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <TrendingUp className="text-pink-600" size={48} />
              </div>
              <h3 className="text-4xl font-bold mb-2">1M+</h3>
              <p className="text-slate-600">Monthly Views</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section id="featured" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Articles</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Handpicked stories from our latest and greatest content
            </p>
          </div>

          {featuredArticles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <FeaturedArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No articles published yet</p>
              <Link href="/admin">
                <Button>Create Your First Article</Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/blog">
              <Button size="lg" variant="outline">
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Browse by Category</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Dive into expertly curated content across multiple topics
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/blog?category=technology">
              <Card className="premium-card border-2 hover:border-blue-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-4xl shadow-lg group-hover:scale-110 transition-transform">
                    💻
                  </div>
                  <CardTitle>Technology</CardTitle>
                  <CardDescription>Latest in tech, AI, and innovation</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/blog?category=lifestyle">
              <Card className="premium-card border-2 hover:border-pink-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-4xl shadow-lg group-hover:scale-110 transition-transform">
                    ✨
                  </div>
                  <CardTitle>Lifestyle</CardTitle>
                  <CardDescription>Health, wellness, and living</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/blog?category=business">
              <Card className="premium-card border-2 hover:border-green-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-4xl shadow-lg group-hover:scale-110 transition-transform">
                    💼
                  </div>
                  <CardTitle>Business</CardTitle>
                  <CardDescription>Entrepreneurship and finance</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/blog?category=travel">
              <Card className="premium-card border-2 hover:border-orange-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-4xl shadow-lg group-hover:scale-110 transition-transform">
                    ✈️
                  </div>
                  <CardTitle>Travel</CardTitle>
                  <CardDescription>Adventures and destinations</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Read Here */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Why Read With Us?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Quality content, expertly curated for you
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-3xl shadow-lg">
                📚
              </div>
              <h3 className="text-xl font-bold mb-2">Curated Content</h3>
              <p className="text-slate-600">
                Every article is carefully selected and edited for quality and relevance
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-3xl shadow-lg">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2">Ad-Free Reading</h3>
              <p className="text-slate-600">
                Clean, distraction-free reading experience focused on content
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-500 text-3xl shadow-lg">
                🔔
              </div>
              <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
              <p className="text-slate-600">
                Get notified when new articles are published in your favorite topics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">Latest Articles</h2>
                <p className="text-slate-600">Fresh content published recently</p>
              </div>
              <Link href="/blog">
                <Button variant="outline">View All →</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <Link href={`/blog/${article.slug}`} key={article.id}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 border">
                    <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-400 relative">
                      {article.coverImage && (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <Badge className="mb-3 bg-purple-100 text-purple-700">
                        {article.category}
                      </Badge>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{article.readTime}</span>
                        <span>•</span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <FooterNewsletter />

      {/* Welcome Popup */}
      <WelcomePopup />

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Stively
              </h3>
              <p className="text-slate-400">
                Your daily dose of inspiration, insights, and knowledge.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/blog" className="hover:text-white">All Articles</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Categories</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/blog?category=technology" className="hover:text-white">Technology</Link></li>
                <li><Link href="/blog?category=lifestyle" className="hover:text-white">Lifestyle</Link></li>
                <li><Link href="/blog?category=business" className="hover:text-white">Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Stively. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}