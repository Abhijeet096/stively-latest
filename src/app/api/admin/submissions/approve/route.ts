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

    const { submissionId, articleId } = await req.json();

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const submissions = db.collection('article_submissions');
    const blogs = db.collection('blogs');

    // Get submission
    const submission = await submissions.findOne({
      _id: new ObjectId(submissionId),
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update article status to published
    await blogs.updateOne(
      { _id: new ObjectId(articleId) },
      {
        $set: {
          status: 'published',
          reviewStatus: 'approved',
          publishedAt: new Date(),
          reviewedBy: session.user.email,
        },
      }
    );

    // Update submission status
    await submissions.updateOne(
      { _id: new ObjectId(submissionId) },
      {
        $set: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: session.user.email,
        },
      }
    );

    // Send approval email to author
    try {
      const article = await blogs.findOne({ _id: new ObjectId(articleId) });
      
      await resend.emails.send({
        from: 'Stively Team <team@stively.com>',
        to: submission.authorEmail,
        subject: '🎉 Your Article has been Published!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Congratulations! 🎉</h1>
                
                <p>Great news! Your article "<strong>${article?.title}</strong>" has been approved and published on Stively.</p>
                
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog/${article?.slug}" 
                     style="display: inline-block; background: linear-gradient(to right, #667eea, #764ba2); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View Your Published Article
                  </a>
                </div>
                
                <p>Your article is now live and being read by our community. Keep up the great work!</p>
                
                <p>Best regards,<br>
                <strong>The Stively Team</strong></p>
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
      message: 'Article approved and published',
    });
  } catch (error) {
    console.error('Error approving submission:', error);
    return NextResponse.json(
      { error: 'Failed to approve submission' },
      { status: 500 }
    );
  }
}