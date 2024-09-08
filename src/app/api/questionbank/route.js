import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mysql';

export async function POST(request) {
  console.log('收到新增題目請求');
  let connection;
  try {
    const { questionType, question, answer, options } = await request.json();
    console.log('請求數據:', { questionType, question, answer, options });

    connection = await connectToDatabase();
    console.log('成功連接到數據庫');

    // 開始事務
    await connection.beginTransaction();

    // 插入問題
    const [questionResult] = await connection.query(
      'INSERT INTO questions (question_type, question_text) VALUES (?, ?)',
      [questionType, question]
    );
    const questionId = questionResult.insertId;
    console.log('問題插入成功, ID:', questionId);

    // 插入答案
    await connection.query(
      'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
      [questionId, answer, true]
    );
    console.log('答案插入成功');

    // 如果是選擇題，插入選項
    if (questionType === 'multiple' && options && options.length) {
      for (const option of options) {
        await connection.query(
          'INSERT INTO options (question_id, option_text) VALUES (?, ?)',
          [questionId, option]
        );
      }
      console.log('選項插入成功');
    }

    // 提交事務
    await connection.commit();
    console.log('事務提交成功');

    return NextResponse.json({ msg: "success", questionId }, { status: 201 });
  } catch (err) {
    console.error('執行查詢時出錯:', err);
    if (connection) {
      await connection.rollback();
      console.log('事務已回滾');
    }
    return NextResponse.json({ 
      msg: "服務器錯誤",
      error: err.message
    }, { status: 500 });
  } finally {
    if (connection) {
      console.log('關閉數據庫連接');
      await connection.end();
    }
  }
}

export async function GET() {
  console.log('收到獲取題目請求');
  let connection;
  try {
    connection = await connectToDatabase();
    console.log('成功連接到數據庫');

    const [questions] = await connection.query('SELECT * FROM questions');
    console.log('檢索到的題目數量:', questions.length);

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error('執行查詢時出錯:', err);
    return NextResponse.json({ 
      msg: "服務器錯誤",
      error: err.message
    }, { status: 500 });
  } finally {
    if (connection) {
      console.log('關閉數據庫連接');
      await connection.end();
    }
  }
}