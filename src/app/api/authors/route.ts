import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const applications = db.collection('author_applications');

    // Check if already applied
    const existingApplication = await applications.findOne({ email });
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already submitted an application' },
        { status: 400 }
      );
    }

    // Create application
    const newApplication = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      status: 'pending',
      appliedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    };

    await applications.insertOne(newApplication);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}