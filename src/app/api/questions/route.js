// src/app/api/questions/route.js
import { connectToDatabase } from '@/lib/mysql';

export async function POST(req) {
  const data = await req.json();

  try {
    const connection = await connectToDatabase();

    const query = `
      INSERT INTO questions (subject_id, question_text, question_type, options, correct_answer)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(query, [
      data.subjectId,
      data.questionText,
      data.questionType,
      JSON.stringify(data.options), // 將 options 轉為 JSON 字串
      data.correctAnswer,
    ]);

    return new Response(JSON.stringify({ id: result.insertId }), { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error.message); // 打印錯誤訊息
    return new Response(JSON.stringify({ error: 'Failed to create question' }), { status: 500 });
  }
}
