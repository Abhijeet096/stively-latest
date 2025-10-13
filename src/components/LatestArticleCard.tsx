'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  coverImage?: string;
  createdAt: Date;
  readTime: string;
}

export default function LatestArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 border">
        {/* Cover Image - FIXED */}
        <div className="h-48 relative overflow-hidden">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-purple-400', 'to-blue-400');
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400" />
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <Badge className="mb-3 bg-purple-100 text-purple-700">
            {article.category}
          </Badge>
          <h3 className="text-xl font-bold mb-2 line-clamp-2">
            {article.title}
          </h3>
          {/* Excerpt - FIXED: Strip HTML tags */}
          <p className="text-slate-600 mb-4 line-clamp-3">
            {article.excerpt.replace(/<[^>]*>/g, '')}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{article.readTime}</span>
            <span>•</span>
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}