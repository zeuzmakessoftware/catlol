import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    // Convert base64 to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create filename with timestamp
    const filename = `image_${Date.now()}.jpg`;
    const filepath = path.join(process.cwd(), 'vision', 'images', filename);

    // Write file
    await writeFile(filepath, buffer);

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ success: false, error: 'Failed to save image' }, { status: 500 });
  }
}
