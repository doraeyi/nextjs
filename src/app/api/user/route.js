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

  try {
    const decoded = verifyJwt(token.value);
    console.log('Decoded token:', decoded);

    if (!decoded || !decoded.account) {
      console.log('Invalid token or missing account');
      return NextResponse.json({ error: "無效的 token" }, { status: 401 });
    }

    // 暫時返回模擬的用戶數據
    const user = { username: decoded.account, email: `${decoded.account}@example.com` };
    console.log('Returning user data:', user);
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: "服務器錯誤" }, { status: 500 });
  }
}