import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    
    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connected successfully!" 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}