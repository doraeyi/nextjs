import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// 數據庫連接配置
const dbConfig = {
  host: 'your_host',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
};

export async function POST(request) {
  let connection;
  try {
    const { username, userId } = await request.json();

    // 驗證用戶名
    if (!username || username.length < 3) {
      return NextResponse.json({ message: '無效的用戶名' }, { status: 400 });
    }

    // 驗證 userId
   

    // 創建數據庫連接
    connection = await mysql.createConnection(dbConfig);

    // 更新數據庫中的用戶名
    const [result] = await connection.execute(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: '未找到用戶或用戶名未變更' }, { status: 404 });
    }

    return NextResponse.json({ message: '用戶名更新成功' }, { status: 200 });
  } catch (error) {
    console.error('更新用戶名時出錯:', error);
    return NextResponse.json({ message: '用戶名更新失敗' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}