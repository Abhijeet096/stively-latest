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
          <h1>Congratulations, ${application.name}! 🎉</h1>
          <p>Your application has been approved!</p>
          <p>Visit: <a href="${process.env.NEXT_PUBLIC_APP_URL}/author/dashboard">Author Dashboard</a></p>
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