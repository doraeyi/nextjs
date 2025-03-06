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

// 根據課程標題判斷課程類別的輔助函數
function determineCourseType(title) {
  // 這裡可以根據實際需求擴展邏輯
  const requiredCourses = ['國文', '英文', '數學', '物理', '化學', '歷史', '地理'];
  if (requiredCourses.includes(title)) {
    return 1; // 1 表示必修
  }
  return 2; // 2 表示選修（預設值）
}

// GET: 獲取用戶的課表和行事曆
export async function GET(req) {
  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const semester = searchParams.get('semester'); // 獲取學期參數

  console.log('GET 請求參數:', { date, semester, account: tokenValidation.account });

  let connection;
  try {
    connection = await connectToDatabase();

    // 修改查詢以支持學期過濾，但使用更寬鬆的條件
    let scheduleQuery = 'SELECT * FROM schedules WHERE account = ?';
    let scheduleParams = [tokenValidation.account];
    
    if (date) {
      scheduleQuery += ' AND (date = ? OR day_of_week = WEEKDAY(?) + 1)';
      scheduleParams.push(date, date);
    }
    
    if (semester) {
      // 使用 LIKE 來處理可能的格式差異
      scheduleQuery += ' AND (semester = ? OR semester LIKE ?)';
      scheduleParams.push(semester, `%${semester}%`);
    }

    console.log('執行課表查詢:', scheduleQuery);
    console.log('查詢參數:', scheduleParams);
    
    // 先檢查學期數據是否存在
    const [semesterCheck] = await connection.execute(
      'SELECT DISTINCT semester FROM schedules WHERE account = ?',
      [tokenValidation.account]
    );
    
    console.log('資料庫中的學期:', semesterCheck.map(s => s.semester));
    
    // 獲取週期性課表
    const [schedules] = await connection.execute(scheduleQuery, scheduleParams);
    
    console.log(`找到 ${schedules.length} 個課程資料`);
    if (schedules.length > 0) {
      console.log('課程範例:', schedules[0]);
    }

    // 獲取行事曆
    let eventQuery = 'SELECT * FROM events WHERE account = ?';
    let eventParams = [tokenValidation.account];
    
    if (date) {
      eventQuery += ' AND date = ?';
      eventParams.push(date);
    }
    
    const [events] = await connection.execute(eventQuery, eventParams);

    return NextResponse.json({ 
      schedules, 
      events,
      debug: {
        semestersInDb: semesterCheck.map(s => s.semester),
        requestedSemester: semester,
        scheduleCount: schedules.length
      }
    });
  } catch (error) {
    console.error("獲取課表和行事曆失敗:", error);
    return NextResponse.json({ error: "獲取課表和行事曆失敗: " + error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// POST: 新增課表或行事曆項目
export async function POST(req) {
  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  let connection;
  try {
    const body = await req.json();
    console.log("Received POST data:", body);
    const { 
      type, 
      date, 
      title, 
      description, 
      start_time, 
      end_time, 
      day_of_week, 
      classroom, 
      credits = null, 
      course_type = null, 
      semester = null 
    } = body;

    if (!type || !title || !start_time || !end_time) {
      return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
    }

    connection = await connectToDatabase();

    // 檢查資料表結構
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM schedules");
      const columnNames = columns.map(col => col.Field);
      console.log("資料表欄位:", columnNames);
    } catch (err) {
      console.error("檢查資料表結構錯誤:", err);
    }

    let query, params;
    if (type === 'schedule') {
      // 判斷課程類別，如果未提供則根據標題自動判斷
      const determinedCourseType = course_type || determineCourseType(title);
      
      // 處理可能存在的 weekday 欄位
      try {
        const [columns] = await connection.execute("SHOW COLUMNS FROM schedules");
        const hasWeekday = columns.some(col => col.Field === 'weekday');
        
        if (hasWeekday) {
          query = `
            INSERT INTO schedules (
              account, date, title, description, start_time, end_time, 
              day_of_week, classroom, credits, course_type, semester, weekday
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          params = [
            tokenValidation.account, date, title, description, start_time, end_time, 
            day_of_week, classroom, credits, determinedCourseType, semester, day_of_week // 使用 day_of_week 作為 weekday
          ];
        } else {
          query = `
            INSERT INTO schedules (
              account, date, title, description, start_time, end_time, 
              day_of_week, classroom, credits, course_type, semester
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          params = [
            tokenValidation.account, date, title, description, start_time, end_time, 
            day_of_week, classroom, credits, determinedCourseType, semester
          ];
        }
      } catch (err) {
        console.error("檢查資料表結構錯誤:", err);
        
        // 使用包含 weekday 的查詢作為備選方案
        query = `
          INSERT INTO schedules (
            account, date, title, description, start_time, end_time, 
            day_of_week, classroom, credits, course_type, semester, weekday
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        params = [
          tokenValidation.account, date, title, description, start_time, end_time, 
          day_of_week, classroom, credits, determinedCourseType, semester, day_of_week // 使用 day_of_week 作為 weekday
        ];
      }
      
      console.log("新增課程參數:", {
        title,
        semester,
        credits,
        courseType: determinedCourseType,
        day_of_week,
        weekday: day_of_week
      });
    } else if (type === 'event') {
      query = 'INSERT INTO events (account, date, title, description, start_time, end_time, classroom) VALUES (?, ?, ?, ?, ?, ?, ?)';
      params = [tokenValidation.account, date, title, description, start_time, end_time, classroom];
    } else {
      return NextResponse.json({ error: "無效的類型" }, { status: 400 });
    }

    const [result] = await connection.execute(query, params);
    console.log("Insert result:", result);

    return NextResponse.json({ 
      message: "新增成功", 
      id: result.insertId,
      course_type: type === 'schedule' ? (course_type || determineCourseType(title)) : null,
      debug: { semester }
    });
  } catch (error) {
    console.error("新增失敗:", error);
    return NextResponse.json({ error: "新增失敗: " + error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// PUT: 更新課表或行事曆項目
export async function PUT(req) {
  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  let connection;
  try {
    const body = await req.json();
    console.log("Received PUT data:", body);
    const { 
      type, 
      id, 
      date, 
      title, 
      description, 
      start_time, 
      end_time, 
      day_of_week, 
      classroom,
      credits,
      course_type,
      semester
    } = body;

    if (!type || !id || !title || !start_time || !end_time) {
      return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
    }

    connection = await connectToDatabase();

    let query, params;
    if (type === 'schedule') {
      // 判斷課程類別，如果未提供則根據標題自動判斷
      const determinedCourseType = course_type || determineCourseType(title);
      
      // 處理可能存在的 weekday 欄位
      try {
        const [columns] = await connection.execute("SHOW COLUMNS FROM schedules");
        const hasWeekday = columns.some(col => col.Field === 'weekday');
        
        if (hasWeekday) {
          query = `
            UPDATE schedules 
            SET date = ?, title = ?, description = ?, start_time = ?, 
                end_time = ?, day_of_week = ?, classroom = ?, 
                credits = ?, course_type = ?, semester = ?, weekday = ? 
            WHERE id = ? AND account = ?
          `;
          params = [
            date, title, description, start_time, end_time, day_of_week, classroom,
            credits, determinedCourseType, semester, day_of_week, id, tokenValidation.account
          ];
        } else {
          query = `
            UPDATE schedules 
            SET date = ?, title = ?, description = ?, start_time = ?, 
                end_time = ?, day_of_week = ?, classroom = ?, 
                credits = ?, course_type = ?, semester = ? 
            WHERE id = ? AND account = ?
          `;
          params = [
            date, title, description, start_time, end_time, day_of_week, classroom,
            credits, determinedCourseType, semester, id, tokenValidation.account
          ];
        }
      } catch (err) {
        console.error("檢查資料表結構錯誤:", err);
        
        // 使用包含 weekday 的查詢作為備選方案
        query = `
          UPDATE schedules 
          SET date = ?, title = ?, description = ?, start_time = ?, 
              end_time = ?, day_of_week = ?, classroom = ?, 
              credits = ?, course_type = ?, semester = ?, weekday = ? 
          WHERE id = ? AND account = ?
        `;
        params = [
          date, title, description, start_time, end_time, day_of_week, classroom,
          credits, determinedCourseType, semester, day_of_week, id, tokenValidation.account
        ];
      }
      
      console.log("更新課程參數:", {
        id,
        title,
        semester,
        credits,
        courseType: determinedCourseType,
        day_of_week,
        weekday: day_of_week
      });
    } else if (type === 'event') {
      query = 'UPDATE events SET date = ?, title = ?, description = ?, start_time = ?, end_time = ?, classroom = ? WHERE id = ? AND account = ?';
      params = [date, title, description, start_time, end_time, classroom, id, tokenValidation.account];
    } else {
      return NextResponse.json({ error: "無效的類型" }, { status: 400 });
    }

    const [result] = await connection.execute(query, params);
    console.log("Update result:", result);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "未找到項目或無權限更新" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "更新成功",
      course_type: type === 'schedule' ? (course_type || determineCourseType(title)) : null,
      debug: { semester }
    });
  } catch (error) {
    console.error("更新失敗:", error);
    return NextResponse.json({ error: "更新失敗: " + error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// DELETE: 刪除課表或行事曆項目
export async function DELETE(req) {
  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!type || !id) {
    return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
  }

  let connection;
  try {
    connection = await connectToDatabase();

    let query;
    if (type === 'schedule') {
      query = 'DELETE FROM schedules WHERE id = ? AND account = ?';
    } else if (type === 'event') {
      query = 'DELETE FROM events WHERE id = ? AND account = ?';
    } else {
      return NextResponse.json({ error: "無效的類型" }, { status: 400 });
    }

    const [result] = await connection.execute(query, [id, tokenValidation.account]);
    console.log("Delete result:", result);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "未找到項目或無權限刪除" }, { status: 404 });
    }

    return NextResponse.json({ message: "刪除成功" });
  } catch (error) {
    console.error("刪除失敗:", error);
    return NextResponse.json({ error: "刪除失敗: " + error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}