import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// List of disposable email domains to block
const DISPOSABLE_DOMAINS: string[] = [
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'temp-mail.org',
  'getnada.com',
  'trashmail.com',
  'fakeinbox.com',
  'yopmail.com',
  'emailondeck.com',
  'sharklasers.com',
  'guerrillamail.info',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.de',
  'spam4.me',
  'mytemp.email',
  'tempmailo.com',
  'dispostable.com',
  'mintemail.com',
  'tempail.com',
  'mohmal.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'opayq.com',
  'rootfest.net',
  'spamherelots.com',
  'tempsky.com',
  'thankyou2010.com',
  'vubby.com',
  'guerrillamailblock.com',
  'safetymail.info',
  'trbvm.com',
  'inboxkitten.com',
  'tempemail.net',
  '33mail.com',
  'email-fake.com',
  'mohmal.im',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'superrito.com',
  'teleworm.us',
  'rhyta.com'
];

// Common fake/test email patterns
const FAKE_EMAIL_PATTERNS = [
  /^test@/i,
  /^fake@/i,
  /^dummy@/i,
  /^sample@/i,
  /^example@/i,
  /^temp@/i,
  /^spam@/i,
  /^admin@/i,
  /^no-?reply@/i,
  /^noreply@/i,
  /@test\./i,
  /@fake\./i,
  /@example\./i,
  /@localhost/i,
  /^test\d*@/i,
  /^fake\d*@/i,
  /^dummy\d*@/i,
  /^user\d*@/i,
  /^email\d*@/i,
  /\+test[@+]/i,
  /\.test@/i,
  /_test@/i,
  /test_/i,
  /asdf@/i,
  /qwerty@/i,
  /123@/i,
];

// Verify if domain has valid MX records
async function verifyEmailDomain(domain: string): Promise<boolean> {
  try {
    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    console.error('MX verification error:', error);
    return true; // Don't block if check fails
  }
}

// Comprehensive email validation
async function isValidEmail(email: string): Promise<{ valid: boolean; error?: string }> {
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];

  // Check fake patterns
  for (const pattern of FAKE_EMAIL_PATTERNS) {
    if (pattern.test(emailLower)) {
      return { valid: false, error: 'Test or fake email addresses are not allowed' };
    }
  }

  // Check disposable domains
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' };
  }

  const username = emailLower.split('@')[0];
  
  if (username.length < 2) {
    return { valid: false, error: 'Email username too short' };
  }

  if (
    /^(a+|1+|test|user|admin|root|null|undefined)$/i.test(username) ||
    /^[a-z]{1,2}$/.test(username) ||
    /^\d{1,3}$/.test(username) ||
    username === 'main' ||
    username.includes('testing') ||
    username.includes('sample')
  ) {
    return { valid: false, error: 'Please use a valid personal email address' };
  }

  // Check typos
  const popularDomains: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmali.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com'
  };

  if (popularDomains[domain]) {
    return { 
      valid: false, 
      error: `Did you mean ${emailLower.split('@')[0]}@${popularDomains[domain]}?` 
    };
  }

  // MX record check
  try {
    const domainIsValid = await verifyEmailDomain(domain);
    if (!domainIsValid) {
      return { valid: false, error: 'This email domain cannot receive emails. Please use a valid email address.' };
    }
  } catch (error) {
    console.error('MX check failed:', error);
  }

  return { valid: true };
}

// POST - Subscribe with email verification
export async function POST(req: NextRequest) {
  try {
    console.log('📧 Newsletter subscription request received');
    
    const { email } = await req.json();

    if (!email || email.trim() === '') {
      console.log('❌ Email is empty');
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('📧 Processing email:', normalizedEmail);

    // Validate email
    const validation = await isValidEmail(normalizedEmail);
    if (!validation.valid) {
      console.log('❌ Email validation failed:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    console.log('✅ Email validation passed');

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const subscribers = db.collection('newsletter_subscribers');

    // Check if email exists
    const existingSubscriber = await subscribers.findOne({ 
      email: normalizedEmail 
    });

    if (existingSubscriber) {
      if (existingSubscriber.verified) {
        console.log('⚠️ Email already verified');
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed!' },
          { status: 400 }
        );
      } else {
        // Resend verification
        console.log('📧 Resending verification email');
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        await subscribers.updateOne(
          { email: normalizedEmail },
          { 
            $set: { 
              verificationToken,
              tokenCreatedAt: new Date()
            } 
          }
        );

        const emailResult = await sendVerificationEmail({ 
          email: normalizedEmail, 
          verificationToken 
        });

        if (!emailResult.success) {
          console.error('❌ Failed to send verification email');
          return NextResponse.json(
            { success: false, error: 'Failed to send verification email. Please try again.' },
            { status: 500 }
          );
        }

        console.log('✅ Verification email resent');
        return NextResponse.json({ 
          success: true, 
          message: 'Verification email sent! Please check your inbox.' 
        });
      }
    }

    // Generate token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Add subscriber (unverified)
    const result = await subscribers.insertOne({
      email: normalizedEmail,
      subscribedAt: new Date(),
      verified: false,
      verificationToken,
      tokenCreatedAt: new Date(),
      status: 'pending',
      source: 'website'
    });

    console.log('✅ Subscriber added (pending verification):', result.insertedId);

    // Send verification email
    const emailResult = await sendVerificationEmail({ 
      email: normalizedEmail, 
      verificationToken 
    });

    if (!emailResult.success) {
      console.error('❌ Failed to send verification email');
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    console.log('✅ Verification email sent successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Please check your email to verify your subscription!' 
    });

  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Fetch verified subscribers only
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('blog-platform');
    const subscribers = db.collection('newsletter_subscribers');

    const allSubscribers = await subscribers
      .find({ verified: true })
      .sort({ subscribedAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      subscribers: allSubscribers,
      count: allSubscribers.length 
    });

  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load subscribers' },
      { status: 500 }
    );
  }
}