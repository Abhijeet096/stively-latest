import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    console.log('🔍 Verification request received');
    console.log('🔍 Token:', token);

    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.redirect(new URL('/verification-failed', req.url));
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const subscribers = db.collection('newsletter_subscribers');

    const subscriber = await subscribers.findOne({ 
      verificationToken: token,
      verified: false 
    });

    console.log('🔍 Subscriber found:', subscriber ? 'YES' : 'NO');

    if (!subscriber) {
      console.log('❌ Invalid or expired token');
      return NextResponse.redirect(new URL('/verification-failed', req.url));
    }

    // Check token expiry (24 hours)
    const tokenAge = Date.now() - new Date(subscriber.tokenCreatedAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (tokenAge > twentyFourHours) {
      console.log('❌ Token expired');
      return NextResponse.redirect(new URL('/verification-expired', req.url));
    }

    // Verify subscriber
    await subscribers.updateOne(
      { _id: subscriber._id },
      { 
        $set: { 
          verified: true,
          status: 'active',
          verifiedAt: new Date()
        },
        $unset: { verificationToken: '', tokenCreatedAt: '' }
      }
    );

    console.log('✅ Email verified:', subscriber.email);

    // Send welcome email
    await sendWelcomeEmail({ email: subscriber.email });
    console.log('✅ Welcome email sent');

    return NextResponse.redirect(new URL('/verification-success', req.url));

  } catch (error) {
    console.error('❌ Email verification error:', error);
    return NextResponse.redirect(new URL('/verification-failed', req.url));
  }
}