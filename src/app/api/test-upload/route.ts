import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('🧪 Test upload API called');
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    return NextResponse.json({
      success: true,
      message: 'Test upload endpoint working',
      hasFile: !!file,
      fileName: file ? file.name : null,
      fileSize: file ? file.size : null,
    });
  } catch (error: any) {
    console.error('Error in test upload:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Test upload endpoint is working',
    method: 'GET'
  });
}