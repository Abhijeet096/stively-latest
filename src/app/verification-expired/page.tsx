import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerificationExpired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Clock size={80} className="text-orange-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Link Expired
        </h1>
        
        <p className="text-gray-600 mb-6">
          This verification link has expired. Verification links are valid for 24 hours. Please subscribe again to receive a new link.
        </p>
        
        <Link href="/">
          <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Subscribe Again
          </Button>
        </Link>
      </div>
    </div>
  );
}