import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const db = await getDatabase();

    // Check if user has already liked this blog
    const blog = await db.collection("blogs").findOne({
      _id: new ObjectId(params.id)
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if user already liked
    const hasLiked = blog.likedBy?.includes(userId);
    if (hasLiked) {
      return NextResponse.json({
        error: "Already liked",
        likes: blog.likes || 0
      }, { status: 400 });
    }

    // Add user to likedBy array and increment likes count
    const result = await db.collection("blogs").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $inc: { likes: 1 },
        $push: { likedBy: userId }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Get updated blog
    const updatedBlog = await db.collection("blogs").findOne({
      _id: new ObjectId(params.id)
    });

    return NextResponse.json({
      success: true,
      likes: updatedBlog?.likes || 0,
      hasLiked: true
    });

  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Failed to like" },
      { status: 500 }
    );
  }
}