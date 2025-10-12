'use client';

import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const hasVisited = localStorage.getItem('has_visited');
    const hasSubscribed = localStorage.getItem('newsletter_subscribed');
    const hasDismissed = localStorage.getItem('welcome_dismissed');

    if (!hasVisited && !hasSubscribed && !hasDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);

      localStorage.setItem('has_visited', 'true');
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('welcome_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        setStatus('error');
        // Better error messages
        const errorMsg = data.error || 'Failed to subscribe';
        if (errorMsg.includes('fake') || errorMsg.includes('test')) {
          setMessage('Please use a real, personal email address');
        } else if (errorMsg.includes('disposable')) {
          setMessage('Temporary email addresses are not allowed');
        } else if (errorMsg.includes('already')) {
          setMessage('This email is already subscribed!');
        } else if (errorMsg.includes('domain')) {
          setMessage('This email domain cannot receive emails. Please use a valid email address.');
        } else {
          setMessage(errorMsg);
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-in slide-in-from-bottom-8 duration-500">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Check Your Email! 📧
            </h2>
            <p className="text-gray-600">
              We've sent you a verification link. Click it to complete your subscription!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-full animate-pulse">
                <Sparkles size={40} className="text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
              Welcome to Stively! 👋
            </h2>
            <p className="text-gray-600 text-center mb-6 text-lg">
              Join <span className="font-bold text-purple-600">50,000+</span> readers getting the best articles delivered to their inbox.
            </p>

            <div className="mb-6 space-y-3 bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-purple-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">Weekly curated articles & insights</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-purple-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">Exclusive content & early access</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-purple-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">No spam, unsubscribe anytime</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {message && status === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  <>
                    <Mail className="inline mr-2" size={20} />
                    Get Started - It's Free!
                  </>
                )}
              </Button>
            </form>

            <button
              onClick={handleClose}
              className="mt-4 text-center w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}