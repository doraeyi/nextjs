'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Home, Info, Settings, Loader } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import '../../styles/navbar.css'

const Navbar = () => {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user data...');
      const res = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('API response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Response data:', data);

        if (data && data.username) {
          setUsername(data.username);
          console.log('Username set successfully:', data.username);
        } else {
          setUsername(null);
          setError('未能獲取有效的用戶名');
          console.log('Invalid username received');
        }
      } else {
        const errorData = await res.json();
        setError(errorData.error || `API 錯誤: ${res.status}`);
        console.log('API error:', res.status, errorData.error);
      }
    } catch (error) {
      console.error('獲取用戶信息失敗:', error);
      setError('網絡錯誤，無法獲取用戶信息');
    } finally {
      setLoading(false);
      console.log('Fetching user data completed');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setUsername(null);
        router.push('/login');
      } else {
        throw new Error('登出失敗');
      }
    } catch (error) {
      console.error('登出錯誤:', error);
      setError('登出失敗，請稍後再試');
    }
  };

  const handleProfileAction = (value) => {
    switch(value) {
      case 'view':
        router.push('/profile');
        break;
      case 'edit':
        router.push('/profile/edit');
        break;
      case 'settings':
        router.push('/profile/settings');
        break;
      case 'dedicated':
        router.push('/dedicated');
        break;
      case 'personprofile':
        router.push('/personprofile');
        break;
      default:
        break;
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getCurrentValue = () => {
    if (pathname.startsWith('/personprofile')) return 'personprofile';
    if (pathname.startsWith('/dedicated')) return 'dedicated';
    if (pathname.startsWith('/profile/edit')) return 'edit';
    if (pathname.startsWith('/profile/settings')) return 'settings';
    return 'view';
  };

  return (
    <nav className='bg-gray-800 dark:bg-gray-900 transition-colors duration-200'>
      <div className='container nav'>
        <Link href='/' className='text-white text-lg font-bold hover:text-gray-300 transition-colors duration-200'>
          Meowtrade
        </Link>
        <div className='space-x-2 flex items-center'>
          {loading ? (
            <span className='text-white'>加載中...</span>
          ) : error ? (
            <span className='text-red-500'>{error}</span>
          ) : username ? (
            <>
              <Select onValueChange={handleProfileAction} value={getCurrentValue()}>
                <SelectTrigger className="w-auto bg-gray-800 dark:bg-gray-700 text-white border-none focus:ring-0 focus:ring-offset-0 transition-colors duration-200">
                  <SelectValue placeholder="個人設定" />
                  <span className='text-white ml-2'>歡迎, {username}</span>
                </SelectTrigger>
                <SelectContent className="bg-gray-700 dark:bg-gray-800 border-none">
                  <SelectGroup>
                    <SelectLabel className="text-gray-300 dark:text-gray-400">個人設定</SelectLabel>
                    <SelectItem value="personprofile" className="text-white hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">個人資料</SelectItem>
                    <SelectItem value="edit" className="text-white hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">編輯個人資料</SelectItem>
                    <SelectItem value="settings" className="text-white hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">帳戶設置</SelectItem>
                    <SelectItem value="dedicated" className="text-white hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">專屬頁面</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select> 
              <button 
                onClick={handleLogout} 
                className='text-white hover:text-gray-300 transition-colors duration-200'
              >
                登出
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={resolvedTheme === 'dark' ? "切換到亮色模式" : "切換到暗色模式"}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-6 w-6 text-yellow-500" />
                ) : (
                  <Moon className="h-6 w-6 text-gray-300" />
                )}
              </button>
            </>
          ) : (
            <Link href='/login' className='text-white hover:text-gray-300 transition-colors duration-200'>
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;