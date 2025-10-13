import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || ((session.user as any).role !== 'author' && (session.user as any).role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const submissions = db.collection('article_submissions');

    const userSubmissions = await submissions
      .find({ authorEmail: session.user.email })
      .sort({ submittedAt: -1 })
      .toArray();

    // Convert ObjectId to string
    const formattedSubmissions = userSubmissions.map(submission => ({
      ...submission,
      _id: submission._id.toString()
    }));

    return NextResponse.json({
      submissions: formattedSubmissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || ((session.user as any).role !== 'author' && (session.user as any).role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      authorName,
      authorEmail,
    } = body;

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const submissions = db.collection('article_submissions');

    // Create submission record
    const newSubmission = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category,
      tags: tags || [],
      status: 'pending',
      authorName: authorName || session.user.name,
      authorEmail: authorEmail || session.user.email,
      authorId: (session.user as any).id,
      submittedAt: new Date(),
      feedback: null,
    };

    const result = await submissions.insertOne(newSubmission);

    return NextResponse.json({
      success: true,
      submissionId: result.insertedId,
      message: 'Article submitted for review successfully',
    });
  } catch (error) {
    console.error('Error submitting article:', error);
    return NextResponse.json(
      { error: 'Failed to submit article' },
      { status: 500 }
    );
  }
}