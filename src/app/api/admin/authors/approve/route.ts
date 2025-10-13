import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
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

    // Get application
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

    // Update application status
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

    // Create user account for author
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
      // Update existing user to author
      await users.updateOne(
        { email: application.email },
        { $set: { role: 'author', status: 'active' } }
      );
    }

    // Send approval email
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
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Congratulations, ${application.name}! 🎉</h1>
                
                <p>We're excited to welcome you as an author at Stively!</p>
                
                <p>Your application has been approved, and you can now start creating amazing content for our community.</p>
                
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #667eea; margin-top: 0;">Next Steps:</h3>
                  <ol>
                    <li style="margin-bottom: 10px;">Visit your author dashboard: <a href="${process.env.NEXT_PUBLIC_APP_URL}/author/dashboard" style="color: #667eea;">Author Dashboard</a></li>
                    <li style="margin-bottom: 10px;">Complete your author profile</li>
                    <li style="margin-bottom: 10px;">Start writing your first article</li>
                    <li>Submit for review and get published!</li>
                  </ol>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Important:</strong> All articles you submit will go through a review process before being published. We'll provide feedback if any changes are needed.</p>
                </div>
                
                <p>If you have any questions, feel free to reach out to us at <a href="mailto:team@stively.com">team@stively.com</a></p>
                
                <p>Happy writing!<br>
                <strong>The Stively Team</strong></p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                
                <p style="font-size: 12px; color: #999;">
                  © 2024 Stively. All rights reserved.
                </p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Continue even if email fails
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