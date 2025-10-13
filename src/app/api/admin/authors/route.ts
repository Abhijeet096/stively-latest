import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import clientPromise from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const applications = db.collection('author_applications');

    const allApplications = await applications
      .find({})
      .sort({ appliedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      applications: allApplications.map(app => ({
        _id: app._id.toString(),
        name: app.name,
        email: app.email,
        message: app.message,
        status: app.status,
        appliedAt: app.appliedAt,
        reviewedAt: app.reviewedAt,
        reviewedBy: app.reviewedBy,
      })),
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}