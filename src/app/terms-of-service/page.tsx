import Link from "next/link";
import { formatDateLong } from "@/lib/utils/dateUtils";
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Stively - Read our terms and conditions for using our website.',
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {formatDateLong(new Date())}</p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Stively ("the Website"), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Use of Website</h2>
            <p className="mb-4">You agree to use the Website only for lawful purposes and in a way that does not infringe the rights of others. You must not:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Use the Website in any way that violates any applicable laws or regulations</li>
              <li className="mb-2">Attempt to gain unauthorized access to our systems</li>
              <li className="mb-2">Transmit any harmful code, viruses, or malware</li>
              <li className="mb-2">Scrape, copy, or reproduce content without permission</li>
              <li className="mb-2">Impersonate any person or entity</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Intellectual Property</h2>
            <p className="mb-4">
              All content on Stively, including text, images, logos, and graphics, is owned by Stively or our content providers 
              and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or create 
              derivative works without our written permission.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. User-Generated Content</h2>
            <p className="mb-4">
              If you submit comments, feedback, or other content to our website, you grant us a non-exclusive, royalty-free, 
              perpetual license to use, modify, and display that content.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Newsletter Subscription</h2>
            <p className="mb-4">
              By subscribing to our newsletter, you consent to receive email communications from us. You can unsubscribe 
              at any time by clicking the unsubscribe link in any email.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Third-Party Links</h2>
            <p className="mb-4">
              Our website may contain links to third-party websites. We are not responsible for the content, privacy 
              practices, or terms of service of these external sites.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Advertising</h2>
            <p className="mb-4">
              We display advertisements through Google AdSense and other advertising partners. We are not responsible 
              for the content of advertisements or products/services advertised.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Disclaimer of Warranties</h2>
            <p className="mb-4">
              The Website is provided "as is" without warranties of any kind, either express or implied. We do not 
              guarantee that the Website will be error-free, uninterrupted, or secure.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Limitation of Liability</h2>
            <p className="mb-4">
              Stively shall not be liable for any indirect, incidental, special, or consequential damages arising from 
              your use of the Website, even if we have been advised of the possibility of such damages.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">10. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold harmless Stively from any claims, damages, or expenses arising from your 
              use of the Website or violation of these terms.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">11. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately 
              upon posting. Your continued use of the Website constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">12. Termination</h2>
            <p className="mb-4">
              We reserve the right to terminate or suspend your access to the Website at any time, without notice, for 
              conduct that we believe violates these Terms of Service or is harmful to other users.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">13. Governing Law</h2>
            <p className="mb-4">
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which Stively operates, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">14. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> team@stively.com<br />
              <strong>Website:</strong> <Link href="/contact" className="text-purple-600 hover:underline">Contact Form</Link>
            </p>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>By using Stively, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
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