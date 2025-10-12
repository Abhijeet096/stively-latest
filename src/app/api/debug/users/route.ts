import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const users = await db.collection("users").find({}).toArray();
    
    return NextResponse.json({
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}