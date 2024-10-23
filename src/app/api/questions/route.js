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

    const optionsValue = data.questionType === 'multiple_choice' ? JSON.stringify(data.options) : null;

    const [result] = await connection.query(query, [
      data.subjectId,
      data.questionText,
      data.questionType,
      optionsValue,
      data.correctAnswer,
    ]);

    return new Response(JSON.stringify({ id: result.insertId }), { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to create question' }), { status: 500 });
  }
}

// GET 方法來根據 subjectId 獲取題目
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');

  if (!subjectId) {
    return new Response(JSON.stringify({ error: 'Subject ID is required' }), { status: 400 });
  }

  try {
    const connection = await connectToDatabase();
    
    const query = `SELECT * FROM questions WHERE subject_id = ?`;
    const [questions] = await connection.query(query, [subjectId]);

    console.log('Fetched questions:', questions);

    // 格式化題目資料，將 options 從 JSON 字串解析為陣列
    const formattedQuestions = questions.map(question => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : [] // 如果 options 不為 null，解析成陣列；否則設置為空陣列
    }));

    return new Response(JSON.stringify(formattedQuestions), { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch questions' }), { status: 500 });
  }
}
