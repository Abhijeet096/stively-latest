import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDateLong } from '@/lib/utils/dateUtils';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Stively - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Stively
          </Link>
          <Link href="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {formatDateLong(new Date())}</p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Stively ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you visit our website stively.com.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2"><strong>Email Address:</strong> When you subscribe to our newsletter</li>
              <li className="mb-2"><strong>Usage Data:</strong> Information about how you use our website (pages visited, time spent, etc.)</li>
              <li className="mb-2"><strong>Cookies:</strong> Small files stored on your device to improve your experience</li>
              <li className="mb-2"><strong>Device Information:</strong> Browser type, IP address, and device type</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Send you our newsletter and updates (if subscribed)</li>
              <li className="mb-2">Improve our website and user experience</li>
              <li className="mb-2">Analyze website traffic and usage patterns</li>
              <li className="mb-2">Respond to your inquiries and provide customer support</li>
              <li className="mb-2">Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to enhance your browsing experience. You can control cookies 
              through your browser settings. However, disabling cookies may affect website functionality.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2"><strong>Google Analytics:</strong> For website analytics</li>
              <li className="mb-2"><strong>Google AdSense:</strong> For displaying advertisements</li>
              <li className="mb-2"><strong>Resend:</strong> For sending email newsletters</li>
              <li className="mb-2"><strong>MongoDB:</strong> For data storage</li>
              <li className="mb-2"><strong>Vercel:</strong> For website hosting</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information. However, no method of 
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Access your personal data</li>
              <li className="mb-2">Correct inaccurate data</li>
              <li className="mb-2">Request deletion of your data</li>
              <li className="mb-2">Unsubscribe from our newsletter at any time</li>
              <li className="mb-2">Object to data processing</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Children's Privacy</h2>
            <p className="mb-4">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the 
              new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> team@stively.com<br />
              <strong>Website:</strong> <Link href="/contact" className="text-purple-600 hover:underline">Contact Form</Link>
            </p>

            <div className="mt-12 p-6 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This privacy policy complies with GDPR, CCPA, and other major privacy regulations. 
                By using our website, you consent to this privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Stively. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}