import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";

export async function POST(
  req: Request
) {
  try {
    const { slug } = await req.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: "Slug is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if slug already exists in published blogs
    const existingBlog = await db.collection("blogs").findOne({
      slug: slug,
      status: "published"
    });

    if (existingBlog) {
      return NextResponse.json(
        { error: "This URL slug is already taken. Please choose a different one." },
        { status: 409 }
      );
    }

    // Also check article submissions to prevent conflicts
    const existingSubmission = await db.collection("article_submissions").findOne({
      slug: slug
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "This URL slug is already used in a pending submission. Please choose a different one." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slug is available",
      slug: slug
    });

  } catch (error: any) {
    console.error("Slug check error:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}
