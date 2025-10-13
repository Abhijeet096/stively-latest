import { NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/aws/s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  console.log('🎯 UPLOAD API CALLED - Site is updated!', new Date());
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Try S3 upload first
      console.log('🔧 Attempting S3 upload...');
      const url = await uploadToS3(buffer, file.name, file.type);
      console.log('✅ S3 upload successful:', url);
      return NextResponse.json({ url });
    } catch (s3Error: any) {
      console.error("❌ S3 upload failed:", s3Error);
      
      // Return error - local storage doesn't work on Vercel
      return NextResponse.json(
        { error: `S3 upload failed: ${s3Error.message}. Please check your AWS configuration.` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}