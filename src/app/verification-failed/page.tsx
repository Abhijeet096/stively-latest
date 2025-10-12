import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerificationFailed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <XCircle size={80} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Verification Failed
        </h1>
        
        <p className="text-gray-600 mb-6">
          This verification link is invalid or has already been used. Please try subscribing again.
        </p>
        
        <Link href="/">
          <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}