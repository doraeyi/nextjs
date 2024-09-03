import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mysql'
import { signJwtAccessToken, verifyJwt } from '@/lib/jwt'

export async function POST(req) {
    const { account, password } = await req.json()
    console.log('Received login request for account:', account);

    if (!account || !password) {
        console.log('Login failed: Missing account or password');
        return NextResponse.json({ error: "帳號和密碼都是必填的" }, { status: 400 })
    }

    try {
        const connection = await connectToDatabase();
        console.log('Database connected successfully');

        // 查詢用戶
        const [results] = await connection.query(
            'SELECT * FROM user WHERE account = ?',
            [account]
        );
        console.log('Query results:', results);

        if (results.length === 0) {
            console.log('Login failed: User not found');
            return NextResponse.json({ error: "用戶未註冊" }, { status: 404 })
        }

        const user = results[0];
        console.log('User found:', { ...user, password: '[REDACTED]' });

        // 使用 bcrypt 比較密碼
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Login failed: Incorrect password');
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

        console.log('Login successful');
        return NextResponse.json({ message: "登錄成功" }, { status: 200 })
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: "服務器內部錯誤" }, { status: 500 })
    }
}

export async function GET(req) {
    // Token verification
    const accessToken = headers().get('authorization')?.split(" ")[1] || ""
    if (accessToken && verifyJwt(accessToken)) {
        return NextResponse.json({ message: '驗證成功' })
    }

    try {
        // 從URL參數中獲取數據
        const { searchParams } = new URL(req.url)
        const name = searchParams.get('name')
        const email = searchParams.get('email')
        
        // 檢查必要的參數是否存在
        if (!name || !email) {
            return NextResponse.json({ error: '缺少必要的參數' }, { status: 400 })
        }
        
        // 連接到數據庫
        const connection = await connectToDatabase()
        
        // 準備SQL語句
        const query = 'INSERT INTO user (name, email) VALUES (?, ?)'
        const values = [name, email]
        
        // 執行插入操作
        const [result] = await connection.execute(query, values)
        
        // 關閉數據庫連接
        await connection.end()
        
        // 返回成功響應
        return NextResponse.json({ message: '數據插入成功', insertId: result.insertId })
    } catch (error) {
        console.error('插入數據時發生錯誤:', error)
        return NextResponse.json({ error: '插入數據時發生錯誤' }, { status: 500 })
    }
}