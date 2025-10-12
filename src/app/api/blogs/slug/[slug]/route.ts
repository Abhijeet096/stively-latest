import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const db = await getDatabase();
    
    // Find blog by slug
    const blog = await db.collection("blogs").findOne({ 
      slug: params.slug,
      status: "published" 
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Increment view count
    await db.collection("blogs").updateOne(
      { slug: params.slug },
      { $inc: { views: 1 } }
    );

    return NextResponse.json(blog);

  } catch (error: any) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}