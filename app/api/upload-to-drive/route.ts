import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fileName, htmlContent } = await request.json();

    // Upload to Vercel Blob Storage
    const blob = await put(fileName, htmlContent, {
      access: 'public',
      contentType: 'text/html',
    });

    return NextResponse.json({
      success: true,
      fileId: blob.pathname,
      fileName: fileName,
      webViewLink: blob.url,
      downloadLink: blob.downloadUrl,
    });
  } catch (error) {
    console.error('Error uploading:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}