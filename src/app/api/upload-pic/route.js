import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    console.log('Received data:', data);

    if (!data || !data.avatarUrl) {
      return NextResponse.json({ message: '没有提供头像URL' }, { status: 400 })
    }

    // 验证URL
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    if (!urlPattern.test(data.avatarUrl)) {
      return NextResponse.json({ message: '无效的URL格式' }, { status: 400 })
    }

    // 这里应该更新用户的头像URL到数据库
    // 假设我们有一个更新用户的函数
    // await updateUserAvatar(req.user.id, data.avatarUrl);

    return NextResponse.json({
      message: '头像URL更新成功',
      avatarUrl: data.avatarUrl
    }, { status: 200 })
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      message: '服務器錯誤，更新失敗',
      error: error.message,
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: '此端点只接受 POST 请求' }, { status: 405 })
}