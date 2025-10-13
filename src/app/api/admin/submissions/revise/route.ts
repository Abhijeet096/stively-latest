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

    const { submissionId, articleId, reviewNotes } = await req.json();

    if (!reviewNotes) {
      return NextResponse.json(
        { error: 'Review notes are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const submissions = db.collection('article_submissions');
    const blogs = db.collection('blogs');

    const submission = await submissions.findOne({
      _id: new ObjectId(submissionId),
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update article status
    await blogs.updateOne(
      { _id: new ObjectId(articleId) },
      {
        $set: {
          reviewStatus: 'revision_requested',
          reviewNotes,
          reviewedBy: session.user.email,
          reviewedAt: new Date(),
        },
      }
    );

    // Update submission
    await submissions.updateOne(
      { _id: new ObjectId(submissionId) },
      {
        $set: {
          status: 'revision_requested',
          reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: session.user.email,
        },
      }
    );

    // Send revision request email
    try {
      const article = await blogs.findOne({ _id: new ObjectId(articleId) });
      
      await resend.emails.send({
        from: 'Stively Team <team@stively.com>',
        to: submission.authorEmail,
        subject: '📝 Revision Requested for Your Article',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Revision Requested</h1>
                
                <p>Hi ${submission.authorName},</p>
                
                <p>We've reviewed your article "<strong>${article?.title}</strong>" and would like to request some revisions before publishing.</p>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <h3 style="margin-top: 0;">Reviewer's Notes:</h3>
                  <p style="white-space: pre-wrap; margin: 0;">${reviewNotes}</p>
                </div>
                
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/author/dashboard" 
                     style="display: inline-block; background: linear-gradient(to right, #667eea, #764ba2); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Edit Your Article
                  </a>
                </div>
                
                <p>Please make the requested changes and resubmit for review.</p>
                
                <p>Best regards,<br>
                <strong>The Stively Team</strong></p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send revision email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Revision requested',
    });
  } catch (error) {
    console.error('Error requesting revision:', error);
    return NextResponse.json(
      { error: 'Failed to request revision' },
      { status: 500 }
    );
  }
}