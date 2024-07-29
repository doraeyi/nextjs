import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mysql'
import { signJwtAccessToken } from '@/lib/jwt'


export const GET = async (req) => {


    return NextResponse.json({})
}

export const POST = async (req) => {
    const { username, password } = await req.json()

    try {
        const connection = await connectToDatabase();

        const [results, fields] = await connection.query(
            'SELECT * FROM user WHERE username = ? AND password = ?',
            [username, password]
        );

        console.log(results)

        if (results.length > 0) {
            const accessToken = signJwtAccessToken(
                {
                    username: results[0].username,
                    gender: results[0].gender,
                    email: results[0].email,
                },
                {
                    // 設定到期時間 
                    expiresIn: '7d'
                }
            )
            console.log('token', accessToken)
            cookies().set('token', accessToken, {
                // 一天
                expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            })
        }
        // console.log(results); 
        // console.log(fields); 

        return NextResponse.json({ msg: "success" })
    } catch (err) {
        console.error('Error executing query:', err);
        return NextResponse.json({})
    }
    return NextResponse.json({})
}