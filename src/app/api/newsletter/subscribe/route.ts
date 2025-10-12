import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    console.log("Newsletter subscription attempt:", email);

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("newsletter");

    // Check if email already exists
    const existing = await collection.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (existing) {
      return NextResponse.json(
        { message: "This email is already subscribed" },
        { status: 400 }
      );
    }

    // Add new subscriber
    const result = await collection.insertOne({
      email: email.toLowerCase().trim(),
      subscribedAt: new Date(),
      source: "popup",
      active: true
    });

    console.log("Successfully subscribed:", email);

    return NextResponse.json(
      { 
        success: true,
        message: "Successfully subscribed!",
        id: result.insertedId 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { message: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}