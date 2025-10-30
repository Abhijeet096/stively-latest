import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db/mongodb";
import slugify from "slugify";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const blogs = await db
      .collection("blogs")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Convert MongoDB _id to string
    const blogsWithStringId = blogs.map(blog => ({
      ...blog,
      _id: blog._id.toString(),
      excerpt: blog.excerpt || '',
      coverImage: blog.coverImage || ''
    }));

    return NextResponse.json(blogsWithStringId);
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Blog API: POST request received');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      console.error('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('📦 Received data:', body);

    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      status,
      featured = false,
    } = body;

    // Validation
    if (!title || !content || !category) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const blogs = db.collection('blogs');

    // Check if slug already exists
    const existingBlog = await blogs.findOne({ slug });
    if (existingBlog) {
      console.error('❌ Slug already exists:', slug);
      return NextResponse.json(
        { error: 'A blog with this slug already exists' },
        { status: 400 }
      );
    }

    const newBlog = {
      title,
      slug,
      content,
      excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200),
      coverImage: coverImage || '',
      category,
      tags: tags || [],
      status: status || 'draft',
      featured: Boolean(featured),
      author: {
        id: (session.user as any).id,
        name: session.user.name,
        email: session.user.email,
      },
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('💾 Saving blog:', newBlog);

    const result = await blogs.insertOne(newBlog);

    console.log('✅ Blog created successfully:', result.insertedId);

    return NextResponse.json({
      success: true,
      blogId: result.insertedId,
    });
  } catch (error: any) {
    console.error('❌ Error creating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog' },
      { status: 500 }
    );
  }
}