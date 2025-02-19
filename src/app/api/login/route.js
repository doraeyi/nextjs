import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mysql';
import { signJwtAccessToken } from '@/lib/jwt';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const GET = async (req) => {
  return NextResponse.json({ message: "Login endpoint is available" });
};

export const POST = async (req) => {
  const body = await req.json();
  
  try {
    const connection = await connectToDatabase();
    
    // Handle regular login
    if (body.account && body.password) {
      if (!body.account || !body.password) {
        return NextResponse.json({ error: "用戶名和密碼都是必填的" }, { status: 400 });
      }

      // 查詢用戶
      const [results] = await connection.query(
        'SELECT * FROM user WHERE account = ?',
        [body.account]
      );

      if (results.length === 0) {
        return NextResponse.json({ error: "用戶未註冊", redirect: "/register" }, { status: 404 });
      }

      const user = results[0];
      console.log('User found:', { ...user, password: '****' });

      // 驗證密碼
      if (user.password !== body.password) {
        console.log('Login failed: Incorrect password');
        console.log('Stored password:', user.password);
        console.log('Provided password:', body.password);
        return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });
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
      );

      // 設置 cookie
      cookies().set('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return NextResponse.json({ message: "登錄成功!" }, { status: 200 });
    }
    
    // Handle Google login
    if (body.access_token && body.userInfo) {
      try {
        const email = body.userInfo.email;
        
        // 檢查用戶是否存在
        const [users] = await connection.query(
          'SELECT * FROM user WHERE email = ?',
          [email]
        );
        
        let user;
        
        if (users.length === 0) {
          // 創建新用戶
          const [result] = await connection.query(
            'INSERT INTO user (email, account, password) VALUES (?, ?, ?)',
            [email, email, 'GOOGLE_LOGIN']
          );
          
          user = {
            id: result.insertId,
            email,
            account: email
          };
        } else {
          user = users[0];
        }
        
        // 生成 JWT token
        const accessToken = signJwtAccessToken(
          {
            account: user.account,
            email: user.email,
            gender: user.gender
          },
          {
            expiresIn: '7d'
          }
        );
        
        // 設置 cookie
        cookies().set('token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        
        return NextResponse.json({ success: true, message: "Google 登入成功" });
        
      } catch (error) {
        console.error('Google authentication error:', error);
        return NextResponse.json(
          { error: "Google 驗證失敗" },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "無效的請求" },
      { status: 400 }
    );
    
  } catch (err) {
    console.error('執行查詢時發生錯誤:', err);
    return NextResponse.json({ error: "服務器內部錯誤" }, { status: 500 });
  }
};