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
    const applicationsCollection = db.collection("author_applications");
    const submissionsCollection = db.collection("article_submissions");
    
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
    
    // NEW: Get pending author applications
    const pendingAuthors = await applicationsCollection.countDocuments({
      status: "pending"
    });
    
    // NEW: Get pending article submissions
    const pendingSubmissions = await submissionsCollection.countDocuments({
      status: "pending"
    });
    
    // NEW: Get total approved authors
    const totalAuthors = await applicationsCollection.countDocuments({
      status: "approved"
    });
    
    return NextResponse.json({
      totalArticles,
      publishedArticles,
      published: publishedArticles, // Alias for compatibility
      draftArticles,
      drafts: draftArticles, // Alias for compatibility
      totalViews,
      totalLikes,
      pendingAuthors, // NEW
      pendingSubmissions, // NEW
      totalAuthors, // NEW
    });
    
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}