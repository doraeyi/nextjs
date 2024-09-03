import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mysql'
import { hash } from 'bcrypt'

export async function POST(req) {
    console.log('收到註冊請求');
    let connection;
    try {
        const { username, gender, account, email, password } = await req.json()
        console.log('請求數據:', { username, gender, account, email, password });
        connection = await connectToDatabase();
        console.log('成功連接到數據庫');

        // 檢查帳號是否已存在
        const [existinguser] = await connection.query(
            'SELECT * FROM user WHERE account = ?',
            [account]
        );
        console.log('檢查用戶是否存在:', existinguser);

        if (existinguser.length > 0) {
            console.log('帳號已存在');
            return NextResponse.json({ msg: "帳號已存在" }, { status: 400 })
        }

         const hashedPassword = await hash(password, 10);

        // 獲取最大的 id 值
        const [maxIdResult] = await connection.query('SELECT MAX(id) as maxId FROM user');
        const nextId = (maxIdResult[0].maxId || 0) + 1;

        // 插入新用戶，明確提供 id 值
        const [result] = await connection.query(
            'INSERT INTO user (id, username, gender, account, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [nextId, username, gender, account, email, password]
        );

        console.log('插入結果:', result);

        if (result.affectedRows > 0) {
            console.log('用戶註冊成功');
            return NextResponse.json({ msg: "success" }, { status: 201 });
        } else {
            console.log('插入新用戶失敗');
            return NextResponse.json({ msg: "註冊失敗", detail: "資料庫插入操作未影響任何行" }, { status: 500 });
        }
    } catch (err) {
        console.error('執行查詢時出錯:', err);
        return NextResponse.json({ 
            msg: "服務器錯誤", 
            error: err.message
        }, { status: 500 });
    } finally {
        if (connection) {
            console.log('關閉數據庫連接');
            await connection.end();
        }
    }
}