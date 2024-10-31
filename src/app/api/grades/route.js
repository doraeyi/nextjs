import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mysql';

// 日誌函數
function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`, data ? JSON.stringify(data) : '');
}

// 驗證 token 的輔助函數
async function validateToken() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    log('No token found');
    return { error: "未登錄", status: 401, redirectTo: "/login" };
  }

  try {
    const decoded = verifyJwt(token.value);
    if (!decoded || !decoded.account) {
      log('Invalid token or missing account');
      return { error: "無效的 token", status: 401, redirectTo: "/login" };
    }
    return { account: decoded.account };
  } catch (error) {
    log('Token validation error:', error);
    return { error: "Token 驗證錯誤", status: 401, redirectTo: "/login" };
  }
}

export async function GET() {
  log('Received GET request to /api/grades');

  // 驗證用戶登錄狀態
  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  let connection;
  try {
    connection = await connectToDatabase();

    // 獲取用戶 ID
    const [users] = await connection.execute(
      'SELECT id FROM user WHERE account = ?',
      [tokenValidation.account]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    const userId = users[0].id;

    // 查詢該用戶的成績
    const [grades] = await connection.query(`
      SELECT 
        grades.id,
        grades.score,
        grades.created_at,
        grades.subjectId,
        grades.semesterId,
        subjects.name as subject_name,
        semesters.name as semester_name
      FROM grades
      LEFT JOIN subjects ON grades.subjectId = subjects.id
      LEFT JOIN semesters ON grades.semesterId = semesters.id
      WHERE grades.userId = ?
      ORDER BY grades.created_at DESC
    `, [userId]);

    log('Fetched grades for user:', { userId, gradesCount: grades.length });
    
    return NextResponse.json(grades);
  } catch (error) {
    log('Error fetching grades:', error);
    return NextResponse.json(
      { error: "獲取成績失敗" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(request) {
  log('Received POST request to /api/grades');

  // 驗證用戶登錄狀態
  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  let connection;
  try {
    const { subjectId, semesterId, score } = await request.json();
    
    // 驗證必要欄位
    if (!subjectId || !semesterId || !score) {
      return NextResponse.json({ 
        error: '科目、學期和分數都是必填項' 
      }, { status: 400 });
    }

    connection = await connectToDatabase();

    // 獲取用戶 ID
    const [users] = await connection.execute(
      'SELECT id FROM user WHERE account = ?',
      [tokenValidation.account]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    const userId = users[0].id;
    
    // 驗證科目和學期是否存在
    const [[subject], [semester]] = await Promise.all([
      connection.query('SELECT id FROM subjects WHERE id = ?', [subjectId]),
      connection.query('SELECT id FROM semesters WHERE id = ?', [semesterId])
    ]);

    if (!subject || !semester) {
      return NextResponse.json({ 
        error: '科目或學期不存在' 
      }, { status: 404 });
    }

    // 插入成績記錄
    const [result] = await connection.query(
      'INSERT INTO grades (subjectId, semesterId, score, userId) VALUES (?, ?, ?, ?)',
      [subjectId, semesterId, score, userId]
    );

    // 獲取插入的記錄
    const [newGrade] = await connection.query(`
      SELECT 
        grades.id,
        grades.score,
        grades.created_at,
        grades.subjectId,
        grades.semesterId,
        subjects.name as subject_name,
        semesters.name as semester_name
      FROM grades
      LEFT JOIN subjects ON grades.subjectId = subjects.id
      LEFT JOIN semesters ON grades.semesterId = semesters.id
      WHERE grades.id = ?
    `, [result.insertId]);

    log('Created new grade:', newGrade[0]);

    return NextResponse.json(newGrade[0], { status: 201 });
  } catch (error) {
    log('Error saving grade:', error);
    return NextResponse.json(
      { error: "新增成績失敗" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}