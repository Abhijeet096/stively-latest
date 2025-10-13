import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const applications = db.collection('author_applications');
    const users = db.collection('users');

    const application = await applications.findOne({
      _id: new ObjectId(applicationId),
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application already reviewed' },
        { status: 400 }
      );
    }

    await applications.updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $set: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: session.user.email,
        },
      }
    );

    const existingUser = await users.findOne({ email: application.email });
    
    if (!existingUser) {
      await users.insertOne({
        name: application.name,
        email: application.email,
        role: 'author',
        status: 'active',
        createdAt: new Date(),
        approvedBy: session.user.email,
      });
    } else {
      await users.updateOne(
        { email: application.email },
        { $set: { role: 'author', status: 'active' } }
      );
    }

    try {
      await resend.emails.send({
        from: 'Stively Team <team@stively.com>',
        to: application.email,
        subject: '🎉 Your Author Application has been Approved!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to the Stively Team!</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Congratulations, ${application.name}!</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
                  Your author application has been approved! You're now part of our content creation team.
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
                  You can now log in to your author dashboard to start creating and submitting articles for review.
                </p>
                
                <p style="font-size: 16px; margin-bottom: 30px; color: #333;">
                  <strong>Important:</strong> Please sign in with your email (<strong>${application.email}</strong>) and your existing password to access your author dashboard.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/signin" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); margin-right: 10px;">
                    Sign In
                  </a>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/author" style="background: transparent; color: #667eea; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; border: 2px solid #667eea;">
                    View Dashboard
                  </a>
                </div>
                
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="color: #667eea; margin-top: 0;">What's Next?</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px; font-size: 15px; color: #333;">📝 Create your first article</li>
                    <li style="margin-bottom: 10px; font-size: 15px; color: #333;">📤 Submit for admin review</li>
                    <li style="margin-bottom: 10px; font-size: 15px; color: #333;">🚀 Get published to our audience</li>
                    <li style="font-size: 15px; color: #333;">📊 Track your article performance</li>
                  </ul>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If you have any questions, feel free to reply to this email - we're here to help!
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  Best regards,<br>
                  <strong>The Stively Team</strong>
                </p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Author approved successfully',
    });
  } catch (error) {
    console.error('Error approving author:', error);
    return NextResponse.json(
      { error: 'Failed to approve author' },
      { status: 500 }
    );
  }
}