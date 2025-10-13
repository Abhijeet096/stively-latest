import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, token } = await req.json();

    if (!email || !password || !token) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('blog-platform');
    const users = db.collection('users');
    const applications = db.collection('author_applications');

    // Verify token and check if application is approved
    const application = await applications.findOne({
      email: email.toLowerCase(),
      status: 'approved',
    });

    if (!application) {
      return NextResponse.json(
        { error: 'No approved application found for this email' },
        { status: 400 }
      );
    }

    // Check if user already has password set
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: 'Account already set up. Please sign in.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update or create user
    if (existingUser) {
      await users.updateOne(
        { email: email.toLowerCase() },
        {
          $set: {
            password: hashedPassword,
            status: 'active',
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await users.insertOne({
        name: application.name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'author',
        status: 'active',
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}