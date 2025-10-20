import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { fileName, htmlContent } = await request.json();

    if (!fileName || !htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Missing fileName or htmlContent' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(fileName, htmlContent, {
      access: 'public',
      contentType: 'text/html',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      webViewLink: blob.url, // For compatibility with existing code
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorStack,
      },
      { status: 500 }
    );
  }
}