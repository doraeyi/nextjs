'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Home, Info, Settings, Loader, UserCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const NavItem = ({ href, Icon, text }) => (
  <Link href={href} className="flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
    <Icon className="h-6 w-6" />
    <span className="text-xs mt-1">{text}</span>
  </Link>
);

const BottomNav = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const [imageToggle, setImageToggle] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching user data...');
      const res = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const userData = await res.json();
        console.log('User data received:', userData);
        setUser(userData);
      } else {
        console.log('Failed to fetch user data, status:', res.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUser();

    const handleUserStateChanged = (event) => {
      console.log('userStateChanged event received', event);
      fetchUser();
    };

    window.addEventListener('userStateChanged', handleUserStateChanged);

    return () => {
      window.removeEventListener('userStateChanged', handleUserStateChanged);
    };
  }, [fetchUser]);

  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);

  if (!mounted) {
    return (
      <nav className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-900 shadow-lg rounded-full">
        <div className="flex justify-center items-center h-16">
          <Loader className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-300" />
        </div>
      </nav>
    );
  }

  const handleImageToggle = () => {
    setImageToggle(!imageToggle);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-900 shadow-lg rounded-full">
      <div className="max-w-screen-xl mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-around w-full">
            <NavItem href="/" Icon={Home} text="首頁" />
            <NavItem href="/about" Icon={Info} text="關於" />
            <div className="w-16" />
            <NavItem href="/settings" Icon={Settings} text="設定" />
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader className="animate-spin h-6 w-6 text-gray-700 dark:text-gray-300" />
                <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">載入中</span>
              </div>
            ) : user ? (
              <Link href="/personalprofile" className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  {user.pic ? (
                    <Image
                      src={user.pic}
                      alt="User Avatar"
                      width={24}
                      height={24}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                      <UserCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">個人檔案</span>
              </Link>
            ) : (
              <Link href="/login" className="flex flex-col items-center">
                <UserCircle className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">登入</span>
              </Link>
            )}
          </div>
        </div>
        <button 
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors overflow-hidden"
          onClick={handleImageToggle}
        >
          <Image
            src={imageToggle ? "/cat2.png" : "/cat1.png"}
            alt="Toggle cat image"
            width={80}
            height={80}
            className="object-cover"
          />
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;