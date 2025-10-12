import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Store contact message in database
    await db.collection("contact-messages").insertOne({
      name,
      email,
      subject: subject || "No subject",
      message,
      createdAt: new Date(),
      status: "unread"
    });

    return NextResponse.json({ 
      success: true,
      message: "Message received successfully" 
    });

  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}