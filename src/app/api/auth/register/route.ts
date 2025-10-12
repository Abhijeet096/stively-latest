import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    console.log("=== Registration attempt started ===");
    const body = await req.json();
    const { name, email, password } = body;
    
    console.log("Received:", { name, email, hasPassword: !!password });

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db("blog-platform");
    console.log("MongoDB connected!");

    // Check if user exists
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log("User already exists");
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("Password hashed!");

    // Create user
    console.log("Creating user in database...");
    const result = await db.collection("users").insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    });

    console.log("User created successfully! ID:", result.insertedId);

    return NextResponse.json(
      { 
        message: "User created successfully",
        userId: result.insertedId.toString()
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("=== REGISTRATION ERROR ===");
    console.error(error);
    return NextResponse.json(
      { error: `Registration failed: ${error.message}` },
      { status: 500 }
    );
  }
}