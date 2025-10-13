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
      // TEMPORARILY DISABLED S3 FOR TESTING
      throw new Error("S3 disabled for testing - using local storage");
      
      // Try S3 upload first
      const url = await uploadToS3(buffer, file.name, file.type);
      return NextResponse.json({ url });
    } catch (s3Error: any) {
      console.log("S3 upload failed, falling back to local storage:", s3Error.message);
      
      // Fallback to local storage
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (dirError) {
        // Directory might already exist
      }
      
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      // Return local URL
      const url = `/uploads/${fileName}`;
      return NextResponse.json({ url });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}