'use client';

import { useState } from 'react';

export default function TestAuthorAPI() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApplication = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/authors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Author',
          email: 'test@example.com',
          message: 'This is a test application',
        }),
      });

      const data = await response.json();
      setResult({
        status: response.status,
        success: response.ok,
        data,
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Author API</h1>
        
        <button
          onClick={testApplication}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Application Submit'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}