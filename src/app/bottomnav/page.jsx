'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Home, Info, Settings, Loader } from 'lucide-react';
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [imageToggle, setImageToggle] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-900 shadow-lg rounded-full">
        <div className="flex justify-center items-center h-16">
          <Loader className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-300" />
        </div>
      </nav>
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

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
            <div className="w-16" /> {/* Placeholder for center button */}
            <NavItem href="/settings" Icon={Settings} text="設定" />
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={resolvedTheme === 'dark' ? "切換到亮色模式" : "切換到暗色模式"}
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="h-6 w-6 text-yellow-500" />
                  <span className="text-xs mt-1 text-gray-300">亮色</span>
                </>
              ) : (
                <>
                  <Moon className="h-6 w-6 text-gray-700" />
                  <span className="text-xs mt-1 text-gray-700">暗色</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Center button with toggle image */}
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