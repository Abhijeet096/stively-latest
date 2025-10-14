import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseWordDocument, parsePDFDocument } from '@/lib/utils/documentParser';

// Configure for file uploads
export const maxDuration = 30; // 30 seconds timeout for file processing

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Add GET method for debugging
export async function GET(req: NextRequest) {
  console.log('🔍 GET request to import-document API');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      message: 'Import document endpoint is working',
      method: 'GET',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  console.log('🚀 Import document API called - Method:', req.method);
  console.log('🚀 Request URL:', req.url);
  
  try {
    console.log('✅ Route reached successfully');

    // Check authentication first
    const session = await getServerSession(authOptions);
    console.log('Session check:', session ? 'Found' : 'Not found');
    console.log('User role:', session?.user ? (session.user as any).role : 'No user');

    if (!session?.user || (session.user as any).role !== 'admin') {
      console.error('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authorized, processing file...');

    const formData = await req.formData();
    console.log('✅ FormData parsed successfully');
    
    const file = formData.get('file') as File;
    console.log('📁 File received:', file ? `${file.name} (${file.size} bytes)` : 'No file');
    
    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.docx')) {
      console.error('❌ Unsupported file type:', fileName);
      return NextResponse.json(
        { error: 'Currently only Word documents (.docx) are supported. PDF support is temporarily unavailable.' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log('💾 File buffer created, size:', fileBuffer.length);

    let result;

    try {
      console.log('📄 Parsing Word document...');
      result = await parseWordDocument(fileBuffer);

      console.log('✅ Document parsed successfully');
      console.log('📊 Result:', {
        title: result.title,
        contentLength: result.html.length,
        imageCount: result.images.length
      });

      return NextResponse.json({
        success: true,
        document: {
          title: result.title,
          content: result.html,
          excerpt: result.excerpt,
          images: result.images,
        },
      });

    } catch (parseError: any) {
      console.error('❌ Error parsing document:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse document: ' + parseError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error in POST handler:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}