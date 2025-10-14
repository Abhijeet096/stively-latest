import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseWordDocument, parsePDFDocument } from '@/lib/utils/documentParser';

// Configure for file uploads
export const maxDuration = 30; // 30 seconds timeout for file processing

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let result;

    if (fileName.endsWith('.docx')) {
      console.log('📄 Parsing Word document...');
      result = await parseWordDocument(fileBuffer);
    } else if (fileName.endsWith('.pdf')) {
      console.log('📄 Parsing PDF document...');
      result = await parsePDFDocument(fileBuffer);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload .docx or .pdf' },
        { status: 400 }
      );
    }

    console.log('✅ Document parsed successfully');

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
    console.error('Error importing document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import document' },
      { status: 500 }
    );
  }
}