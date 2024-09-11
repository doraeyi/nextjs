import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username } = await request.json();

    // 在這裡進行用戶名驗證
    if (!username || username.length < 3) {
      return NextResponse.json({ message: '無效的用戶名' }, { status: 400 });
    }

    // TODO: 更新數據庫中的用戶名
    // 例如：await User.update({ username }, { where: { id: userId } });

    return NextResponse.json({ message: '用戶名更新成功' }, { status: 200 });
  } catch (error) {
    console.error('更新用戶名時出錯:', error);
    return NextResponse.json({ message: '用戶名更新失敗' }, { status: 500 });
  }
}