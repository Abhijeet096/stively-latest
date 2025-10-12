import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    // Increment like count
    const result = await db.collection("blogs").updateOne(
      { _id: new ObjectId(params.id) },
      { $inc: { likes: 1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Get updated like count
    const blog = await db.collection("blogs").findOne({ 
      _id: new ObjectId(params.id) 
    });

    return NextResponse.json({ 
      success: true, 
      likes: blog?.likes || 0 
    });

  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Failed to like" },
      { status: 500 }
    );
  }
}