import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mysql';

export async function GET(req) {
  console.log('Received request to /api/user');
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    console.log('No token found');
    return NextResponse.json({ error: "未登錄" }, { status: 401 });
  }

  console.log('Token found:', token.value);

  let connection;
  try {
    const decoded = verifyJwt(token.value);
    console.log('Decoded token result:', decoded);

    if (!decoded || !decoded.account) {
      console.log('Invalid token or missing account');
      return NextResponse.json({ error: "無效的 token" }, { status: 401 });
    }

    console.log('Decoded token:', decoded);

    connection = await connectToDatabase();
    const [results] = await connection.execute(
      'SELECT username, email FROM user WHERE username = ?',
      [decoded.account]
    );

    console.log('Database query results:', results);

    if (results.length === 0) {
      console.log('User not found in database');
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    const user = results[0];
    console.log('Returning user data:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: "服務器錯誤" }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}