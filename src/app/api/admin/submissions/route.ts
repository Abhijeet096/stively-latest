import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const submissions = db.collection('article_submissions');

    // Get all submissions directly (they contain all the data we need)
    const allSubmissions = await submissions
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    // Format submissions for the frontend
    const formattedSubmissions = allSubmissions.map((submission) => ({
      _id: submission._id.toString(),
      title: submission.title,
      content: submission.content,
      excerpt: submission.excerpt,
      category: submission.category,
      tags: submission.tags || [],
      status: submission.status,
      author: {
        name: submission.authorName,
        email: submission.authorEmail,
      },
      createdAt: submission.submittedAt,
      feedback: submission.feedback,
    }));

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}