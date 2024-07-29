'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GoogleOAuthProvider } from '@react-oauth/google';

const LoginPage = () => {
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error('Login failed.');
      }

      const data = await res.json();

      if (data.msg === 'success') {
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Stay on login page if there's an error
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: tokenResponse => {
      const access_token = tokenResponse.access_token;

      fetch('/api/playfab-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: access_token }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          router.push('/');
        } else {
          console.error('PlayFab error:', data.error);
        }
      })
      .catch(err => console.error('Error:', err));
    },
    onError: err => {
      console.error('Google login error:', err);
    }
  });

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='mx-auto max-w-md p-6 bg-white shadow-md rounded-lg w-full'>
        <form onSubmit={handleSubmit}>
          <div className='text-2xl mt-4'>登入</div>
          <div className='grid gap-2 mt-4'>
            <Label htmlFor='username'>Username</Label>
            <Input id='username' type='text' className='w-full' placeholder='帳號' />
          </div>
          <div className='grid gap-2 mt-4'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' className='w-full' placeholder='密碼' />
            <Link href='#' className='ml-auto inline-block text-sm underline'>忘記密碼？</Link>
          </div>
          <Button type='submit' className='w-full'>登入</Button>
        </form>
        <div className='mt-4 flex flex-col gap-2'>
          <Button variant='outline' className='w-full' onClick={googleLogin}>
            使用 Google 登入
          </Button>
        </div>
        <div className='mt-4 text-center text-sm'>
          還沒有帳號？{' '}
          <Link href='/signup' className='underline'>註冊</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
