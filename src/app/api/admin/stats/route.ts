import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const blogsCollection = db.collection("blogs");

    // Get all articles
    const totalArticles = await blogsCollection.countDocuments();
    
    // Get published articles
    const publishedArticles = await blogsCollection.countDocuments({ 
      status: "published" 
    });
    
    // Get draft articles
    const draftArticles = await blogsCollection.countDocuments({ 
      status: "draft" 
    });

    // Calculate total views
    const viewsResult = await blogsCollection
      .aggregate([
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
      ])
      .toArray();
    
    const totalViews = viewsResult[0]?.totalViews || 0;

    // Calculate total likes
    const likesResult = await blogsCollection
      .aggregate([
        { $group: { _id: null, totalLikes: { $sum: "$likes" } } }
      ])
      .toArray();
    
    const totalLikes = likesResult[0]?.totalLikes || 0;

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalLikes
    });

  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}