import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();
    const roastPath = path.join(process.cwd(), 'vision', 'images', filename.replace('.jpg', '_roast.txt'));
    
    // Wait for the roast file to be created (max 30 seconds)
    let attempts = 0;
    while (attempts < 30) {
      try {
        const roast = await readFile(roastPath, 'utf-8');
        return NextResponse.json({ success: true, roast });
      } catch (error) {
        console.error('Error generating roast:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }
    
    throw new Error('Timeout waiting for roast');
  } catch (error) {
    console.error('Failed to get roast:', error);
    return NextResponse.json({ success: false, error: 'Failed to get roast' }, { status: 500 });
  }
}
