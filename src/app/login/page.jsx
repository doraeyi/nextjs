'use client';
 
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaGoogle } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

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
        toast.success('登入成功！');
        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);
      } else {
        throw new Error(data.error || '登入失敗。請稍後再試!。');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      toast.error(error.message);
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
    onSuccess: async (response) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        
        // Call your backend with the access token and user info
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            access_token: response.access_token,
            userInfo: userInfo
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Google 登入失敗');
        }

        if (data.success) {
          toast.success('Google 登入成功！');
          setTimeout(() => {
            window.location.href = '/home';
          }, 1500);
        } else {
          throw new Error(data.error || 'Google 登入失敗');
        }
      } catch (error) {
        console.error('Google login error:', error);
        setError(error.message);
        toast.error(error.message);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google 登入失敗，請稍後再試。');
      toast.error('Google 登入失敗，請稍後再試。');
    },
    scope: 'email profile',
  });

  return (
    <div className='flex flex-col justify-start items-center bg-gradient-to-br p-4 pt-12 sm:pt-24'>
      <Toaster position="top-center" reverseOrder={false} />
      <div className='w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden'>
        <div className='p-6'>
          <h2 className='text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white'>登入 MeowTrade</h2>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='account' className="text-sm font-medium text-gray-700 dark:text-gray-300">帳號</Label>
              <Input 
                id='account' 
                name='account' 
                type='text' 
                placeholder='請輸入帳號' 
                required 
                className="mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor='password' className="text-sm font-medium text-gray-700 dark:text-gray-300">密碼</Label>
              <Input 
                id='password' 
                name='password' 
                type='password' 
                placeholder='請輸入密碼' 
                required 
                className="mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center'>
                <input id="remember_me" name="remember_me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="remember_me" className="ml-2 block text-gray-700 dark:text-gray-300">
                  記住我
                </label>
              </div>
              <Link href='/forgot-password' className='font-medium text-blue-600 dark:text-blue-400 hover:underline'>
                忘記密碼？
              </Link>
            </div>
            <Button 
              type='submit' 
              className='w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-150 ease-in-out' 
              disabled={loading}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
          </form>
        </div>
        <div className='px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600'>
          <Button 
            variant='outline' 
            className='w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150 ease-in-out' 
            onClick={() => googleLogin()} 
            disabled={loading}
          >
            <FaGoogle className="w-4 h-4" />
            <span>使用 Google 登入</span>
          </Button>
          <p className='mt-4 text-center text-xs text-gray-600 dark:text-gray-400'>
            還沒有帳號？{' '}
            <Link href='/signup' className='font-medium text-blue-600 dark:text-blue-400 hover:underline'>
              立即註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  ); 
};

export default LoginPage;