'use client';

import { useEffect, useState } from 'react';
import { Mail, Download, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  verified: boolean;
  status: string;
  source: string;
  verifiedAt?: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/newsletter');
      const data = await response.json();

      if (data.success) {
        setSubscribers(data.subscribers || []);
      } else {
        setError(data.error || 'Failed to load subscribers');
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (subscribers.length === 0) {
      alert('No verified subscribers to export!');
      return;
    }

    const headers = ['Email', 'Subscribed At', 'Verified At', 'Status', 'Source'];
    const csvData = subscribers.map(sub => [
      sub.email,
      new Date(sub.subscribedAt).toLocaleString(),
      sub.verifiedAt ? new Date(sub.verifiedAt).toLocaleString() : 'N/A',
      sub.status,
      sub.source
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verified-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Newsletter Subscribers</h1>
        <p className="text-gray-600">
          Manage your verified email subscribers and export for campaigns
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Verified Subscribers</h2>
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {loading ? '...' : subscribers.length}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Only verified subscribers appear here
            </p>
          </div>
          <CheckCircle size={64} className="text-green-500" />
        </div>
      </div>

      {/* Export Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={exportToCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={20} />
          Export CSV ({subscribers.length})
        </button>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-xl shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-600">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-lg font-semibold">{error}</p>
            <button
              onClick={fetchSubscribers}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Mail size={48} className="mb-4 text-gray-300" />
            <p className="text-lg">No verified subscribers yet</p>
            <p className="text-sm mt-2">
              Users must click the verification link in their email to appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subscribed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Verified At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(subscriber.subscribedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {subscriber.verifiedAt 
                        ? new Date(subscriber.verifiedAt).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        ✓ {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {subscriber.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}