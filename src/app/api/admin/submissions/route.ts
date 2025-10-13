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
    const submissions = db.collection('article_submissions');
    const blogs = db.collection('blogs');

    // Get all submissions
    const allSubmissions = await submissions
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    // Get article details for each submission
    const submissionsWithDetails = await Promise.all(
      allSubmissions.map(async (submission) => {
        const article = await blogs.findOne({
          _id: submission.articleId,
        });

        return {
          _id: submission._id.toString(),
          articleId: submission.articleId,
          authorName: submission.authorName,
          authorEmail: submission.authorEmail,
          title: submission.title || article?.title,
          status: submission.status,
          submittedAt: submission.submittedAt,
          reviewedAt: submission.reviewedAt,
          reviewNotes: submission.reviewNotes,
          article: article ? {
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            category: article.category,
            coverImage: article.coverImage,
          } : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      submissions: submissionsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}