'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import '../../styles/navbar.css'

const Navbar = () => {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

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
      case 'personaldata':
        router.push('/personaldata');
        break;
      default:
        break;
    }
  };

  return (
    <nav className='bg-gray-800'>
      <div className='container nav'>
        <Link href='/' className='text-white text-lg font-bold'>
          Meowtrade
        </Link>
        <div className='space-x-2 flex items-center'>
          {loading ? (
            <span className='text-white'>加載中...</span>
          ) : error ? (
            <span className='text-red-500'>{error}</span>
          ) : username ? (
            <>
              <span className='text-white'>歡迎, {username}</span>
              <Select onValueChange={handleProfileAction} value={pathname.startsWith('/dedicated') ? 'dedicated' : 'view'}>
                <SelectTrigger className="w-[100px] bg-gray-800 text-white border-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="個人資料" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-none">
                  <SelectGroup>
                    <SelectLabel className="text-gray-300">個人資料</SelectLabel>
                    <SelectItem value="personaldata" className="text-white hover:bg-gray-600">個人資料</SelectItem>
                    <SelectItem value="edit" className="text-white hover:bg-gray-600">編輯個人資料</SelectItem>
                    <SelectItem value="settings" className="text-white hover:bg-gray-600">帳戶設置</SelectItem>
                    {/* 注意：這裡移除了 isDedicated 檢查，因為我們只關注 username */}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <button onClick={handleLogout} className='text-white hover:text-gray-300'>
                登出
              </button>
            </>
          ) : (
            <Link href='/login' className='text-white hover:text-gray-300'>
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;