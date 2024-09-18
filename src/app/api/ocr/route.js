// 文件: pages/api/ocr.js
import Tesseract from 'tesseract.js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing form data' });
        return;
      }

      try {
        const imagePath = files.image.path;
        const { data: { text } } = await Tesseract.recognize(imagePath, 'chi_tra+eng');
        
        // 删除临时文件
        fs.unlinkSync(imagePath);

        res.status(200).json({ text });
      } catch (error) {
        console.error('OCR Error:', error);
        res.status(500).json({ error: 'OCR processing failed' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}