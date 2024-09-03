import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mysql'
import { signJwtAccessToken } from '@/lib/jwt'

export const GET = async (req) => {
    return NextResponse.json({ message: "Login endpoint is available" })
}

export const POST = async (req) => {
    const { account, password } = await req.json()

    if (!account || !password) {
        return NextResponse.json({ error: "用戶名和密碼都是必填的" }, { status: 400 })
    }

    try {
        const connection = await connectToDatabase();

        // 查詢用戶
        const [results] = await connection.query(
            'SELECT * FROM user WHERE account = ?',
            [account]
        );

        if (results.length === 0) {
            // 用戶不存在，返回錯誤信息
            return NextResponse.json({ error: "用戶未註冊", redirect: "/register" }, { status: 404 })
        }

        const user = results[0];

        console.log('User found:', { ...user, password: '****' });

        // 驗證密碼（注意：這裡假設密碼是明文存儲的，實際應用中應該使用哈希）
        if (user.password !== password) {
            console.log('Login failed: Incorrect password');
            console.log('Stored password:', user.password);
            console.log('Provided password:', password);
            return NextResponse.json({ error: "密碼錯誤" }, { status: 401 })
        }
        // 生成 JWT token
        const accessToken = signJwtAccessToken(
            {
                account: user.account,
                gender: user.gender,
                email: user.email,
            },
            {
                expiresIn: '7d'
            }
        )

        // 設置 cookie
        cookies().set('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天
        })

        return NextResponse.json({ message: "登錄成功" }, { status: 200 })
    } catch (err) {
        console.error('執行查詢時發生錯誤:', err);
        return NextResponse.json({ error: "服務器內部錯誤" }, { status: 500 })
    }
}