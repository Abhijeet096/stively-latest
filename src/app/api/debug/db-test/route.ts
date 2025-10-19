import { NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    const client = await clientPromise;
    const db = client.db('blog-platform');
    
    // Test basic connection
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    // Check blogs collection
    const blogsCollection = db.collection("blogs");
    const totalBlogs = await blogsCollection.countDocuments();
    const publishedBlogs = await blogsCollection.countDocuments({ status: "published" });
    
    // Get sample blog data
    const sampleBlogs = await blogsCollection
      .find({})
      .limit(5)
      .toArray();
    
    // Check users collection
    const usersCollection = db.collection("users");
    const totalUsers = await usersCollection.countDocuments();
    const adminUsers = await usersCollection.countDocuments({ role: "admin" });
    
    const result = {
      connection: "success",
      collections: collections.map(c => c.name),
      stats: {
        totalBlogs,
        publishedBlogs,
        totalUsers,
        adminUsers
      },
      sampleBlogs: sampleBlogs.map(blog => ({
        _id: blog._id.toString(),
        title: blog.title,
        status: blog.status,
        category: blog.category,
        createdAt: blog.createdAt
      }))
    };
    
    console.log("Database test result:", result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { 
        connection: "failed", 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}