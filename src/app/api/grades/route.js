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

    // 直接使用 account 查詢成績，添加 locked 字段
    const [grades] = await connection.query(`
      SELECT 
        id,
        student_id,
        student_name,
        academic_year,
        term,
        course_id,
        course_name,
        course_category,
        teacher_name,
        score_type,
        score,
        credits,
        locked,
        ranking,
        total_courses,
        total_credits,
        pass_courses,
        pass_credits,
        class_rank,
        average_score,
        account
      FROM grades
      WHERE account = ?
      ORDER BY academic_year DESC, term DESC, id DESC
    `, [tokenValidation.account]);

    log('Fetched grades for account:', { account: tokenValidation.account, gradesCount: grades.length });
    
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
    const gradeData = await request.json();
    
    // 驗證必要欄位
    const requiredFields = [
      'academic_year', 'term', 'course_id', 'course_name', 
      'course_category', 'teacher_name', 'score_type', 'score', 'credits'
    ];
    
    const missingFields = requiredFields.filter(field => !gradeData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `以下欄位為必填: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    connection = await connectToDatabase();

    // 獲取用戶信息
    const [users] = await connection.execute(
      'SELECT id, name FROM user WHERE account = ?',
      [tokenValidation.account]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    const userId = users[0].id;
    const userName = users[0].name;
    
    // 準備插入數據，添加 locked 字段
    const insertData = {
      student_id: userId,
      student_name: userName,
      academic_year: gradeData.academic_year,
      term: gradeData.term,
      course_id: gradeData.course_id,
      course_name: gradeData.course_name,
      course_category: gradeData.course_category,
      teacher_name: gradeData.teacher_name,
      score_type: gradeData.score_type,
      score: gradeData.score,
      credits: gradeData.credits,
      locked: gradeData.locked || 0, // 默认为0表示未锁定
      ranking: gradeData.ranking || null,
      total_courses: gradeData.total_courses || null,
      total_credits: gradeData.total_credits || null,
      pass_courses: gradeData.pass_courses || null,
      pass_credits: gradeData.pass_credits || null,
      class_rank: gradeData.class_rank || null,
      average_score: gradeData.average_score || null,
      account: tokenValidation.account  // 添加 account 欄位
    };
    
    // 動態生成 SQL 語句
    const fields = Object.keys(insertData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(insertData);
    
    // 插入成績記錄
    const [result] = await connection.query(
      `INSERT INTO grades (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    // 獲取插入的記錄
    const [newGrade] = await connection.query(`
      SELECT * FROM grades WHERE id = ?
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