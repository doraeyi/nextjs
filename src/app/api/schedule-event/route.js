import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mysql';

// 驗證 token 的輔助函數
async function validateToken() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    console.log('No token found');
    return { error: "未登錄", status: 401, redirectTo: "/login" };
  }

  try {
    const decoded = verifyJwt(token.value);
    if (!decoded || !decoded.account) {
      console.log('Invalid token');
      return { error: "無效的 token", status: 401, redirectTo: "/login" };
    }
    console.log('Token validated for account:', decoded.account);
    return { account: decoded.account };
  } catch (error) {
    console.error("Token 驗證錯誤:", error);
    return { error: "Token 驗證錯誤", status: 500 };
  }
}

// GET: 獲取用戶的課表和行事曆
export async function GET(req) {
  console.log('GET request received');
  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  console.log('Fetching data for date:', date);

  let connection;
  try {
    connection = await connectToDatabase();

    // 獲取課表
    const [schedules] = await connection.execute(
      'SELECT * FROM schedules WHERE account = ? AND date = ?',
      [tokenValidation.account, date]
    );

    // 獲取行事曆
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE account = ? AND date = ?',
      [tokenValidation.account, date]
    );

    console.log(`Retrieved ${schedules.length} schedules and ${events.length} events`);
    return NextResponse.json({ schedules, events });
  } catch (error) {
    console.error("獲取課表和行事曆失敗:", error);
    return NextResponse.json({ error: "獲取課表和行事曆失敗", details: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// POST: 新增課表或行事曆項目
export async function POST(req) {
  console.log('POST request received');
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
    const { type, date, title, description, startTime, endTime } = body;
    console.log('Received data:', { type, date, title, description, startTime, endTime });

    connection = await connectToDatabase();

    let query, params;
    if (type === 'schedule') {
      query = 'INSERT INTO schedules (account, date, title, description, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)';
    } else if (type === 'event') {
      query = 'INSERT INTO events (account, date, title, description, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)';
    } else {
      console.log('Invalid type:', type);
      return NextResponse.json({ error: "無效的類型" }, { status: 400 });
    }

    params = [tokenValidation.account, date, title, description, startTime, endTime];

    const [result] = await connection.execute(query, params);
    console.log('Insert result:', result);

    return NextResponse.json({ message: "新增成功", id: result.insertId });
  } catch (error) {
    console.error("新增失敗:", error);
    return NextResponse.json({ error: "新增失敗", details: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// PUT: 更新課表或行事曆項目
export async function PUT(req) {
  console.log('PUT request received');
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
    const { type, id, date, title, description, startTime, endTime } = body;
    console.log('Received data for update:', { type, id, date, title, description, startTime, endTime });

    connection = await connectToDatabase();

    let query, params;
    if (type === 'schedule') {
      query = 'UPDATE schedules SET date = ?, title = ?, description = ?, start_time = ?, end_time = ? WHERE id = ? AND account = ?';
    } else if (type === 'event') {
      query = 'UPDATE events SET date = ?, title = ?, description = ?, start_time = ?, end_time = ? WHERE id = ? AND account = ?';
    } else {
      console.log('Invalid type:', type);
      return NextResponse.json({ error: "無效的類型" }, { status: 400 });
    }

    params = [date, title, description, startTime, endTime, id, tokenValidation.account];

    const [result] = await connection.execute(query, params);
    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      console.log('No rows affected. Item not found or no permission.');
      return NextResponse.json({ error: "未找到項目或無權限更新" }, { status: 404 });
    }

    return NextResponse.json({ message: "更新成功" });
  } catch (error) {
    console.error("更新失敗:", error);
    return NextResponse.json({ error: "更新失敗", details: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// DELETE: 刪除課表或行事曆項目
export async function DELETE(req) {
  console.log('DELETE request received');
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
  console.log('Received data for deletion:', { type, id });

  if (!type || !id) {
    console.log('Missing required parameters');
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
      console.log('Invalid type:', type);
      return NextResponse.json({ error: "無效的類型" }, { status: 400 });
    }

    const [result] = await connection.execute(query, [id, tokenValidation.account]);
    console.log('Delete result:', result);

    if (result.affectedRows === 0) {
      console.log('No rows affected. Item not found or no permission.');
      return NextResponse.json({ error: "未找到項目或無權限刪除" }, { status: 404 });
    }

    return NextResponse.json({ message: "刪除成功" });
  } catch (error) {
    console.error("刪除失敗:", error);
    return NextResponse.json({ error: "刪除失敗", details: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}