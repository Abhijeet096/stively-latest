'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    // Basic client-side validation
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('✅ Check your email to verify your subscription!');
        setEmail('');
        
        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        // Better error messages
        const errorMsg = data.error || 'Failed to subscribe';
        if (errorMsg.includes('fake') || errorMsg.includes('test')) {
          setMessage('❌ Please use a real, personal email address');
        } else if (errorMsg.includes('disposable')) {
          setMessage('❌ Temporary email addresses are not allowed');
        } else if (errorMsg.includes('already')) {
          setMessage('❌ This email is already subscribed!');
        } else if (errorMsg.includes('domain')) {
          setMessage('❌ This email domain cannot receive emails');
        } else {
          setMessage(`❌ ${errorMsg}`);
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('❌ Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <Mail size={48} className="mx-auto mb-4" />
        <h2 className="text-4xl font-bold mb-4">Never Miss an Update</h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Subscribe to get the latest articles delivered straight to your inbox
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 rounded-lg text-slate-900 flex-1 disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
          <Button 
            type="submit"
            size="lg" 
            disabled={status === 'loading' || status === 'success'}
            className="bg-white text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Sent!' : 'Subscribe'}
          </Button>
        </form>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg inline-flex items-center gap-2 ${
            status === 'success' 
              ? 'bg-green-500/20 border border-green-300' 
              : 'bg-red-500/20 border border-red-300'
          }`}>
            {status === 'success' ? (
              <CheckCircle size={20} className="text-green-100" />
            ) : (
              <XCircle size={20} className="text-red-100" />
            )}
            <p className="text-lg font-semibold">{message}</p>
          </div>
        )}
      </div>
    </section>
  );
}