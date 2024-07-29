import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mysql'
import { signJwtAccessToken, verifyJwt } from '@/lib/jwt'
import { headers } from 'next/headers'

export const GET = async (req) => {
    const accessToken = headers().get('authorization').split(" ")[1] || ""
    if (accessToken && verifyJwt(accessToken)) {
        return NextResponse.json({ message: '驗證成功' })
      }
    

    return NextResponse.json({})
}