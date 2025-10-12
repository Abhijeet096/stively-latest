import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerificationSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle size={80} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Email Verified! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for verifying your email! You're now subscribed to Stively and will receive our latest articles and updates.
        </p>
        
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-purple-800 font-medium">
            Check your inbox for a welcome message!
          </p>
        </div>
        
        <Link href="/blog">
          <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Start Reading Articles
          </Button>
        </Link>
      </div>
    </div>
  );
}