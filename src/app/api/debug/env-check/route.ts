import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the current environment variables
    const mongoUri = process.env.MONGODB_URI;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    if (!mongoUri) {
      return NextResponse.json({
        status: "error",
        message: "MONGODB_URI environment variable is missing",
        recommendation: "Add MONGODB_URI to your environment variables"
      });
    }
    
    // Parse the connection string to get details
    const uri = new URL(mongoUri.replace('mongodb+srv://', 'https://'));
    const username = uri.username;
    const hostname = uri.hostname;
    const database = mongoUri.split('/').pop()?.split('?')[0];
    
    return NextResponse.json({
      status: "info",
      environment: nodeEnv || "development",
      nextAuthUrl,
      mongodb: {
        cluster: hostname,
        username: username,
        database: database,
        connectionStringFormat: "mongodb+srv://[username]:[password]@[cluster]/[database]"
      },
      recommendation: {
        step1: "Go to MongoDB Atlas → Network Access",
        step2: "Add IP: 0.0.0.0/0 (allow all IPs for testing)",
        step3: "Go to Database Access → verify user exists",
        step4: "Test connection again"
      },
      maskedUri: mongoUri.replace(/:[^:@]*@/, ':***@')
    });
    
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
      recommendation: "Check your MONGODB_URI format"
    });
  }
}