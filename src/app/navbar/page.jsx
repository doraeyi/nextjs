'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import '../../styles/navbar.css'

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [pathname]);  // 每當 pathname 改變時重新獲取用戶信息

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        throw new Error('登出失敗');
      }
    } catch (error) {
      console.error('登出錯誤:', error);
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
      default:
        break;
    }
  };

  const isDedicatedUser = () => {
    return user && user.username === 'liam';
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
          ) : user ? (
            <>
              <span className='text-white'>歡迎, {user.username || '未知用戶'}</span>
              {user.username && (
                <Select onValueChange={handleProfileAction} value={pathname.startsWith('/dedicated') ? 'dedicated' : 'view'}>
                  <SelectTrigger className="w-[100px] bg-gray-800 text-white border-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="個人資料" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-none">
                    <SelectGroup>
                      <SelectLabel className="text-gray-300">個人資料</SelectLabel>
                      <SelectItem value="view" className="text-white hover:bg-gray-600">個人資料</SelectItem>
                      <SelectItem value="edit" className="text-white hover:bg-gray-600">編輯個人資料</SelectItem>
                      <SelectItem value="settings" className="text-white hover:bg-gray-600">帳戶設置</SelectItem>
                      {isDedicatedUser() && (
                        <SelectItem value="dedicated" className="text-white hover:bg-gray-600 text-sm">專屬用戶</SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
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