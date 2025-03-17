import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mysql';

// 驗證 token 的輔助函數
async function validateToken() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  if (!token) {
    return { error: "未登錄", status: 401, redirectTo: "/login" };
  }
  try {
    const decoded = verifyJwt(token.value);
    if (!decoded || !decoded.account) {
      return { error: "無效的 token", status: 401, redirectTo: "/login" };
    }
    return { account: decoded.account };
  } catch (error) {
    console.error("Token 驗證錯誤:", error);
    return { error: "Token 驗證錯誤", status: 500 };
  }
}

// GET: 獲取課程安排數據
export async function GET(req) {
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
    
    // 獲取課程安排數據
    const [courses] = await connection.execute('SELECT * FROM course_schedule ORDER BY semester, course_name');
    
    // 計算各類別統計
    const categoryCredits = {};
    let totalCredits = 0;
    
    courses.forEach(course => {
      const category = course.course_category.toString();
      const credits = parseInt(course.credits) || 0;
      
      if (!categoryCredits[category]) {
        categoryCredits[category] = 0;
      }
      
      categoryCredits[category] += credits;
      totalCredits += credits;
    });
    
    return NextResponse.json({
      courses,
      stats: {
        totalCredits,
        categoryCredits
      },
      status: "success"
    });
  } catch (error) {
    console.error("獲取課程安排數據失敗:", error);
    return NextResponse.json(
      { error: "獲取課程安排數據失敗: " + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}