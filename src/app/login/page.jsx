'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (account, password) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `登入失敗。狀態碼: ${res.status}`);
      }

      if (data.message === '登錄成功') {
        // 使用 router.replace() 确保页面更新
        // router.replace('/home');
        window.location.href = '/home'
      } else {
        throw new Error(data.error || '登入失敗。請稍後再試。');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const account = event.target.account.value;
    const password = event.target.password.value;
    handleLogin(account, password);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const { access_token } = tokenResponse;
      if (access_token) {
        try {
          const res = await fetch('/api/google-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Google 登入失敗');
          }

          if (data.success) {
            // 使用 router.replace() 确保页面更新
            // router.replace('/home');
            window.location.href = '/home'
          } else {
            throw new Error(data.message || 'Google 登入失敗');
          }
        } catch (error) {
          console.error('Google login error:', error);
          setError(error.message);
        }
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      setError('Google 登入失敗，請稍後再試。');
    },
  });

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='mx-auto max-w-md p-8 bg-white shadow-md rounded-lg w-full'>
        <form onSubmit={handleSubmit}>
          <h2 className='text-2xl font-bold mb-6 text-center'>登入</h2>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className='space-y-4'>
            <div>
              <Label htmlFor='account'>帳號</Label>
              <Input id='account' name='account' type='text' placeholder='請輸入帳號' required />
            </div>
            <div>
              <Label htmlFor='password'>密碼</Label>
              <Input id='password' name='password' type='password' placeholder='請輸入密碼' required />
            </div>
            <Link href='/forgot-password' className='text-sm text-blue-600 hover:underline block text-right'>
              忘記密碼？
            </Link>
          </div>
          <Button type='submit' className='w-full mt-6' disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </Button>
        </form>
        <div className='mt-6'>
          <Button variant='outline' className='w-full' onClick={() => googleLogin()} disabled={loading}>
            使用 Google 登入
          </Button>
        </div>
        <div className='mt-6 text-center text-sm'>
          還沒有帳號？{' '}
          <Link href='/signup' className='text-blue-600 hover:underline'>
            註冊
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
