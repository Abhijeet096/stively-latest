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
    
    // Diagnostic logging
    console.log("/api/blogs POST - session status:", {
      hasUser: !!session?.user,
      role: (session?.user as any)?.role,
      id: (session?.user as any)?.id,
      name: session?.user?.name,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: no session" },
        { status: 401 }
      );
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: requires admin role" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      content,
      coverImage,
      category,
      tags,
      status,
      seo,
    } = body;

    // Validation
    if (!title || !description || !content || !coverImage) {
      return NextResponse.json(
        { error: "Missing required fields", received: { title: !!title, description: !!description, content: !!content, coverImage: !!coverImage } },
        { status: 400 }
      );
    }

    if (typeof coverImage !== "string") {
      return NextResponse.json(
        { error: "Invalid coverImage type", type: typeof coverImage },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Generate slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await db.collection("blogs").findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create blog document
    const blog = {
      title,
      slug,
      description,
      content,
      coverImage,
      category,
      tags: tags || [],
      status: status || "draft",
      author: {
        id: (session.user as any).id,
        name: session.user.name || "Admin",
      },
      seo: {
        metaTitle: seo?.metaTitle || title,
        metaDescription: seo?.metaDescription || description,
        keywords: seo?.keywords || [],
      },
      views: 0,
      likes: 0,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: status === "published" ? new Date() : null,
    };

    const result = await db.collection("blogs").insertOne(blog);
    console.log("/api/blogs POST - insertedId:", result.insertedId?.toString());

    return NextResponse.json(
      {
        message: "Blog created successfully",
        blogId: result.insertedId,
        slug,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating blog:", error);
    const message = error?.message || "Failed to create blog";
    const stack = error?.stack;
    return NextResponse.json(
      { error: message, stack },
      { status: 500 }
    );
  }
}