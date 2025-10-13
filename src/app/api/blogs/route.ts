import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import slugify from "slugify";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const db = await getDatabase();
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
      _id: blog._id.toString()
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
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
      status,
      featured = false, // NEW: Default to false
    } = body;

    const db = await getDatabase();

    // Check if slug already exists
    const existingBlog = await db.collection("blogs").findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { error: 'A blog with this slug already exists' },
        { status: 400 }
      );
    }

    const newBlog = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      coverImage: coverImage || '',
      category: category || 'Uncategorized',
      tags: tags || [],
      status: status || 'draft',
      featured: Boolean(featured), // NEW: Save featured status
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

    const result = await db.collection("blogs").insertOne(newBlog);

    return NextResponse.json({
      success: true,
      blogId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}