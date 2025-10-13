import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Send email to you (admin)
    const result = await resend.emails.send({
      from: 'Stively Contact Form <team@stively.com>',
      to: 'team@stively.com', // Your email - change if needed
      replyTo: email, // User's email so you can reply directly
      subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #667eea;">New Contact Form Submission</h2>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
              </div>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #667eea;">Message:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #999;">
                This email was sent from the contact form on stively.com
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Contact form email sent:', result);

    // Optional: Send auto-reply to user
    await resend.emails.send({
      from: 'Stively Team <team@stively.com>',
      to: email,
      subject: 'We received your message!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #667eea;">Thank You for Contacting Us!</h2>
              
              <p>Hi ${name},</p>
              
              <p>We've received your message and will get back to you within 24-48 hours.</p>
              
              <div style="background: #f8f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0;"><strong>Your message:</strong></p>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <p>Best regards,<br><strong>The Stively Team</strong></p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #999;">
                © 2024 Stively. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}