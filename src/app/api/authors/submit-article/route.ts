import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import clientPromise from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
    } = body;

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const blogs = db.collection('blogs');
    const submissions = db.collection('article_submissions');

    // Check if slug already exists
    const existingBlog = await blogs.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
      );
    }

    // Create article with pending status
    const newBlog = {
      title,
      slug,
      content,
      excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200),
      coverImage: coverImage || '',
      category,
      tags: tags || [],
      status: 'pending_review', // Special status for author submissions
      featured: false,
      author: {
        id: (session.user as any).id,
        name: session.user.name,
        email: session.user.email,
        role: 'author',
      },
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedForReview: true,
      reviewStatus: 'pending',
    };

    const result = await blogs.insertOne(newBlog);

    // Create submission record
    await submissions.insertOne({
      articleId: result.insertedId.toString(),
      authorId: (session.user as any).id,
      authorName: session.user.name,
      authorEmail: session.user.email,
      title,
      status: 'pending',
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null,
    });

    return NextResponse.json({
      success: true,
      articleId: result.insertedId,
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