import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import slugify from "slugify";

// GET single blog
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const blog = await db.collection("blogs").findOne({ 
      _id: new ObjectId(params.id) 
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error: any) {
    console.error("Error fetching blog:", error);
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

// UPDATE blog
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug: customSlug,
      description,
      content,
      coverImage,
      category,
      tags,
      status,
      seo,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Handle slug generation and validation
    const existingBlog = await db.collection("blogs").findOne({ 
      _id: new ObjectId(params.id) 
    });

    let slug = existingBlog?.slug;

    // If custom slug is provided, use it (with validation)
    if (customSlug && customSlug.trim()) {
      const cleanSlug = slugify(customSlug.trim(), { lower: true, strict: true });
      
      // Check if this slug is unique (excluding current blog)
      const slugExists = await db.collection("blogs").findOne({ 
        slug: cleanSlug, 
        _id: { $ne: new ObjectId(params.id) } 
      });

      if (slugExists) {
        return NextResponse.json(
          { error: `The slug "${cleanSlug}" is already in use. Please choose a different URL slug.` },
          { status: 400 }
        );
      }
      
      slug = cleanSlug;
    }
    // Only generate new slug if no custom slug provided AND title changed
    else if (existingBlog && existingBlog.title !== title && !customSlug) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await db.collection("blogs").findOne({ 
        slug, 
        _id: { $ne: new ObjectId(params.id) } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updateData: any = {
      title,
      slug,
      description,
      content,
      coverImage,
      category,
      tags: tags || [],
      status: status || "draft",
      seo: {
        metaTitle: seo?.metaTitle || title,
        metaDescription: seo?.metaDescription || description,
        keywords: seo?.keywords || [],
      },
      updatedAt: new Date(),
    };

    // If changing to published, set publishedAt
    if (status === "published" && existingBlog?.status !== "published") {
      updateData.publishedAt = new Date();
    }

    const result = await db.collection("blogs").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Blog updated successfully",
      slug
    });

  } catch (error: any) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE blog
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const result = await db.collection("blogs").deleteOne({ 
      _id: new ObjectId(params.id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}