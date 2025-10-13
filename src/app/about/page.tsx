import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Users, Target, Heart } from 'lucide-react';

export const metadata = {
  title: 'About Us',
  description: 'Learn about Stively - your destination for insightful articles, expert analysis, and compelling stories.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Stively
          </Link>
          <nav className="flex gap-4">
            <Link href="/blog">
              <Button variant="ghost">Blog</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            About Stively
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your daily dose of inspiration, insights, and knowledge
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-purple-600" size={32} />
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At Stively, we believe in the power of knowledge and storytelling. Our mission is to deliver high-quality, 
              insightful content that inspires, educates, and empowers our readers to stay ahead in an ever-changing world.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We curate articles across technology, lifestyle, business, and more, bringing you expert analysis, 
              deep dives, and compelling stories that matter.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">Community</h3>
              <p className="text-gray-600">
                Building a community of 50,000+ readers who value quality content
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">Quality Content</h3>
              <p className="text-gray-600">
                Carefully curated articles from expert writers and industry leaders
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="text-pink-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">Weekly Newsletter</h3>
              <p className="text-gray-600">
                Get the best articles delivered directly to your inbox
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter and never miss an update
          </p>
          <Link href="/">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Stively. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}