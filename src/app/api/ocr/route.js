// 文件: src/app/api/ocr/route.js
import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('image');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const filename = file.name.replace(/\.[^/.]+$/, "");
  const tempDir = os.tmpdir();
  const filepath = path.join(tempDir, `${filename}.jpg`);

  try {
    await fs.promises.writeFile(filepath, Buffer.from(buffer));
    const { data: { text } } = await Tesseract.recognize(filepath, 'chi_tra+eng');

    // 删除临时文件
    await fs.promises.unlink(filepath);

    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
  }
}