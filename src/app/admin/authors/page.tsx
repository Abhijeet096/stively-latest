'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, X, UserPlus, Mail } from 'lucide-react';

interface AuthorApplication {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export default function ManageAuthorsPage() {
  const [applications, setApplications] = useState<AuthorApplication[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
    generateInviteLink();
  }, []);

  const loadApplications = async () => {
    try {
      const res = await fetch('/api/admin/authors');
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/apply-author?invite=${token}`;
    setInviteLink(link);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async (applicationId: string) => {
    if (!confirm('Approve this author application?')) return;

    try {
      const res = await fetch('/api/admin/authors/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });

      if (res.ok) {
        alert('Author approved! They can now login and submit articles.');
        loadApplications();
      } else {
        alert('Failed to approve author');
      }
    } catch (error) {
      alert('Error approving author');
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!confirm('Reject this author application?')) return;

    try {
      const res = await fetch('/api/admin/authors/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });

      if (res.ok) {
        alert('Author application rejected');
        loadApplications();
      } else {
        alert('Failed to reject author');
      }
    } catch (error) {
      alert('Error rejecting author');
    }
  };

  const pendingApplications = applications.filter((a) => a.status === 'pending');
  const approvedApplications = applications.filter((a) => a.status === 'approved');
  const rejectedApplications = applications.filter((a) => a.status === 'rejected');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Authors</h1>
          <p className="text-gray-600">Invite and manage content authors</p>
        </div>

        {/* Invite Link Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold">Invite Authors</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Share this link with potential authors. They can apply to become a content creator.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
            />
            <Button onClick={copyInviteLink} className="flex items-center gap-2">
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Mail className="text-orange-600" />
              Pending Applications ({pendingApplications.length})
            </h2>
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{app.name}</h3>
                      <p className="text-gray-600">{app.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
                  </div>
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm font-semibold mb-1">Message:</p>
                    <p className="text-gray-700">{app.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(app._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(app._id)}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Authors */}
        {approvedApplications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              Approved Authors ({approvedApplications.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {approvedApplications.map((app) => (
                <div key={app._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{app.name}</h3>
                      <p className="text-sm text-gray-600">{app.email}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Approved</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading applications...</p>
          </div>
        )}

        {!loading && applications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Share the invite link to start receiving author applications.</p>
          </div>
        )}
      </div>
    </div>
  );
}