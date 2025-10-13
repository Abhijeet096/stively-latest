'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function FeaturedArticleCard({ article }: { article: Article }) {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Check if user is subscribed
  const isSubscribed = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('newsletter_subscribed') === 'true';
  };

  const handleClick = (e: React.MouseEvent) => {
    // Check if user is already subscribed
    if (isSubscribed()) {
      // Let them through
      return;
    }

    // Show popup for non-subscribers
    e.preventDefault();
    setShowPopup(true);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Check your email to verify!');
        localStorage.setItem('newsletter_subscribed', 'true');
        
        // Close popup and redirect after 2 seconds
        setTimeout(() => {
          setShowPopup(false);
          window.location.href = `/blog/${article.slug}`;
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Link href={`/blog/${article.slug}`} onClick={handleClick}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
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
          <div className="p-6">
            <Badge className="mb-3 bg-purple-100 text-purple-700">
              {article.category}
            </Badge>
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              {article.title}
            </h3>
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

      {/* Subscription Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {status === 'success' ? (
              <div className="text-center py-4">
                <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold mb-2">Almost There!</h3>
                <p className="text-gray-600">
                  Check your email to verify your subscription, then you can read this article.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
                    <Mail size={32} className="text-white" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-3">
                  Subscribe to Read
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  This is a premium article. Subscribe to our newsletter to unlock access to all featured content!
                </p>

                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
                  />

                  {message && status === 'error' && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{message}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe & Read'}
                  </Button>
                </form>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Free forever • Unsubscribe anytime
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}