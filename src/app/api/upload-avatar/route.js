import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data || !data.avatar) {
      return NextResponse.json({ message: '沒有上傳文件或請求體為空' }, { status: 400 })
    }

    // 檢查文件類型
    const match = data.avatar.match(/^data:image\/(png|jpeg|gif);base64,/)
    if (!match) {
      return NextResponse.json({ message: '只允許上傳 PNG、JPEG 或 GIF 格式的圖片' }, { status: 400 })
    }

    const type = match[1]
    const base64Data = data.avatar.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // 生成唯一的文件名
    const uniqueFilename = `${Date.now()}-${randomBytes(8).toString('hex')}.${type}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, uniqueFilename)

    await writeFile(filePath, buffer)

    // 這裡應該更新用戶的頭像 URL 到數據庫
    // 假設我們有一個更新用戶的函數
    // await updateUserAvatar(req.user.id, `/uploads/${uniqueFilename}`);

    return NextResponse.json({ 
      message: '頭像上傳成功',
      avatarUrl: `/uploads/${uniqueFilename}`
    }, { status: 200 })
  } catch (error) {
    console.error('上傳頭像時出錯:', error)
    return NextResponse.json({ 
      message: '服務器錯誤，上傳失敗',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: '此端點只接受 POST 請求' }, { status: 405 })
}