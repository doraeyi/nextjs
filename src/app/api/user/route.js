import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mysql';
import bcrypt from 'bcrypt';

// 日誌函數
function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`, data ? JSON.stringify(data) : '');
}

// 錯誤處理函數
function handleError(error, customMessage) {
  console.error(`[${new Date().toISOString()}] ${customMessage}:`, error);
  return NextResponse.json({ 
    error: customMessage, 
    details: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  }, { status: 500 });
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
    return handleError(error, "Token 驗證錯誤");
  }
}

// GET 路由: 獲取用戶信息
export async function GET(req) {
  log('Received GET request to /api/user');

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
    const [rows] = await connection.execute(
      'SELECT username, account, pic FROM user WHERE account = ?',
      [tokenValidation.account]
    );

    if (rows.length === 0) {
      log('User not found');
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    const user = rows[0];
    log('Returning user data:', user);
    return NextResponse.json(user);
  } catch (error) {
    return handleError(error, "獲取用戶信息失敗");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}


// POST 路由: 更新用戶資料
export async function POST(request) {
  log('Received POST request to /api/user');

  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  let connection;
  try {
    const body = await request.json();
    // 安全地記錄數據，不泄露密碼
    log('Received data:', { 
      username: body.username, 
      hasPassword: !!body.newPassword, 
      passwordLength: body.newPassword ? body.newPassword.length : 0,
      pic: body.pic ? (typeof body.pic === 'string' ? `${body.pic.substring(0, 15)}...` : '[非字符串]') : undefined
    });

    const { username, newPassword, pic } = body;

    if (!username || username.length < 3) {
      return NextResponse.json({ error: '無效的用戶名' }, { status: 400 });
    }

    connection = await connectToDatabase();

    // 先檢查用戶是否存在
    const [userCheck] = await connection.execute(
      'SELECT account FROM user WHERE account = ?',
      [tokenValidation.account]
    );
    
    if (userCheck.length === 0) {
      log('用戶不存在:', tokenValidation.account);
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }
    
    log('用戶存在，準備更新資料');

    // 分開處理有無密碼更新的情況
    let query, params;
    let passwordUpdated = false;
    
    // 檢查 newPassword 是否有值且不為空白字符串
    if (newPassword && newPassword.trim() !== '') {
      log('檢測到新密碼，長度:', newPassword.length);
      
      if (newPassword.length < 6) {
        log('密碼太短，要求至少6個字符');
        return NextResponse.json({ error: '密碼長度不足，至少需要6個字符' }, { status: 400 });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      log('密碼已加密，準備更新用戶名、頭像和密碼');
      
      query = 'UPDATE user SET username = ?, pic = ?, password = ? WHERE account = ?';
      params = [username, pic || '', hashedPassword, tokenValidation.account];
      passwordUpdated = true;
    } else {
      log('無新密碼，僅更新用戶名和頭像');
      query = 'UPDATE user SET username = ?, pic = ? WHERE account = ?';
      params = [username, pic || '', tokenValidation.account];
    }

    log('執行 SQL 查詢:', { 
      query, 
      paramsCount: params.length,
      firstParam: params[0],
      lastParam: params[params.length - 1]
    });

    const [result] = await connection.execute(query, params);
    log('查詢結果:', result);

    if (result.affectedRows === 0) {
      log('資料未變更或用戶不存在');
      return NextResponse.json({ error: '未找到用戶或資料未變更' }, { status: 404 });
    }

    log('資料更新成功', { passwordUpdated });
    return NextResponse.json({ 
      message: '資料更新成功',
      passwordUpdated 
    }, { status: 200 });
  } catch (error) {
    log('更新用戶資料失敗', { errorMessage: error.message, stack: error.stack });
    return NextResponse.json({ 
      error: "更新用戶資料失敗", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
      log('數據庫連接已關閉');
    }
  }
}
// PUT 路由: 更新用戶頭像
export async function PUT(request) {
  log('Received PUT request to /api/user');

  const tokenValidation = await validateToken();
  if (tokenValidation.error) {
    return NextResponse.json(
      { error: tokenValidation.error, redirectTo: tokenValidation.redirectTo },
      { status: tokenValidation.status }
    );
  }

  let connection;
  try {
    const { pic } = await request.json();

    if (!pic) {
      return NextResponse.json({ error: '無效的頭像 URL' }, { status: 400 });
    }

    connection = await connectToDatabase();

    const query = 'UPDATE user SET pic = ? WHERE account = ?';
    const params = [pic, tokenValidation.account];

    log('Executing query:', { query, params: params.map(p => typeof p === 'string' ? p.substring(0, 10) + '...' : p) });

    const [result] = await connection.execute(query, params);

    log('Query result:', result);

    if (result.affectedRows === 0) {
      log('User not found or no changes made');
      return NextResponse.json({ error: '未找到用戶或頭像未變更' }, { status: 404 });
    }

    log('Profile picture updated successfully');
    return NextResponse.json({ message: '頭像更新成功' }, { status: 200 });
  } catch (error) {
    return handleError(error, "更新用戶頭像失敗");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}