import { NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

export async function GET() {
  console.log("🔍 Testing MongoDB connection with detailed diagnostics...");
  
  const uri = process.env.MONGODB_URI;
  console.log("Connection URI (masked):", uri?.replace(/:[^:@]*@/, ':***@'));
  
  if (!uri) {
    return NextResponse.json({
      error: "MONGODB_URI environment variable not found",
      status: "failed"
    }, { status: 500 });
  }

  let client;
  
  try {
    // Test basic connection
    console.log("🔄 Attempting to connect...");
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    // Test database access
    const db = client.db('blog-platform');
    console.log("📚 Accessing blog-platform database");
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log("📋 Collections found:", collections.map(c => c.name));
    
    // Test blogs collection specifically
    const blogsCollection = db.collection("blogs");
    
    // Count documents
    const totalBlogs = await blogsCollection.countDocuments();
    const publishedBlogs = await blogsCollection.countDocuments({ status: "published" });
    
    console.log(`📊 Blog stats: ${publishedBlogs}/${totalBlogs} published`);
    
    // Get sample published blogs
    const sampleBlogs = await blogsCollection
      .find({ status: "published" })
      .limit(3)
      .project({ title: 1, status: 1, createdAt: 1, category: 1 })
      .toArray();
    
    console.log("📝 Sample published blogs:", sampleBlogs);
    
    // Test users collection
    const usersCollection = db.collection("users");
    const totalUsers = await usersCollection.countDocuments();
    const adminUsers = await usersCollection.countDocuments({ role: "admin" });
    
    return NextResponse.json({
      status: "success",
      connection: "✅ Connected successfully",
      database: "blog-platform",
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
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error);
    
    let errorDetails = {
      status: "failed",
      error: error.message,
      code: error.code,
      codeName: error.codeName,
      timestamp: new Date().toISOString()
    };
    
    // Specific error handling
    if (error.message.includes('authentication failed')) {
      errorDetails = {
        ...errorDetails,
        issue: "Authentication credentials are incorrect",
        solution: "Check MongoDB Atlas Database Access settings"
      } as any;
    } else if (error.message.includes('connection refused')) {
      errorDetails = {
        ...errorDetails,
        issue: "Cannot reach MongoDB cluster",
        solution: "Check MongoDB Atlas Network Access settings (IP whitelist)"
      } as any;
    } else if (error.message.includes('timeout')) {
      errorDetails = {
        ...errorDetails,
        issue: "Connection timeout",
        solution: "Check network connectivity and Atlas cluster status"
      } as any;
    }
    
    return NextResponse.json(errorDetails, { status: 500 });
    
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Disconnected from MongoDB");
    }
  }
}