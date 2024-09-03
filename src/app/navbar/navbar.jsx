'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter()

  React.useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const res = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      })

      const data = await res.json()

      console.log(data)
      setUser(data)
      setLoading(false)
    }
    
    fetchUser()
    
  }, [])

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

  return (
    <nav className='bg-gray-800 p-4'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link href='/' className='text-white text-lg font-bold'>
          Meowtrade
        </Link>
        <div className='space-x-4 flex items-center'>
          {loading ? (
            <span className='text-white'>加載中...</span>
          ) : user ? (
            <>
              <span className='text-white'>歡迎, {user.username || '未知用戶'}</span>
              {user.username && (
                <Link href='/profile' className='text-white hover:text-gray-300'>
                  個人資料
                </Link>
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
