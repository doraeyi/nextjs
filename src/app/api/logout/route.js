import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  
  // 清除 token cookie
  cookieStore.delete('token');

  return NextResponse.json({ message: "已成功登出" }, { status: 200 });
}