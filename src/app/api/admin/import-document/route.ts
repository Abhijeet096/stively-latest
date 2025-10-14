import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseWordDocument, parsePDFDocument } from '@/lib/utils/documentParser';

// Configure for file uploads
export const maxDuration = 30; // 30 seconds timeout for file processing

export async function POST(req: NextRequest) {
  console.log('🚀 Import document API called');
  
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      console.error('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authorized, processing file...');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📁 File received:', file.name, 'Size:', file.size);

    const fileName = file.name.toLowerCase();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    console.log('💾 File buffer created, size:', fileBuffer.length);

    let result;

    if (fileName.endsWith('.docx')) {
      console.log('📄 Parsing Word document...');
      result = await parseWordDocument(fileBuffer);
    } else if (fileName.endsWith('.pdf')) {
      console.log('📄 Parsing PDF document...');
      result = await parsePDFDocument(fileBuffer);
    } else {
      console.error('❌ Unsupported file type:', fileName);
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload .docx or .pdf files only.' },
        { status: 400 }
      );
    }

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
  } catch (error: any) {
    console.error('❌ Error importing document:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import document',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}