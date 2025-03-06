'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { 
  Home, Info, Calendar, Settings, Loader, UserCircle, 
  XIcon, BookOpen, Camera, Music, ChevronRight, Plus,
  ImageIcon, Pencil
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { format, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

// NavItem Component
const NavItem = ({ href, Icon, text, onClick, isActive }) => (
  <Link 
    href={href} 
    className={`flex flex-col items-center ${
      isActive 
        ? 'text-blue-500 dark:text-blue-400' 
        : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
    }`}
    onClick={onClick}
  >
    <Icon className="h-6 w-6" />
    <span className="text-xs mt-1">{text}</span>
  </Link>
);

// MenuContent Component
const MenuContent = ({ items, activeMenu, onClose }) => {
  const [date, setDate] = useState(new Date());
  const [message, setMessage] = useState(null);

  const showMessage = (title, description, isError = false) => {
    setMessage({ title, description, isError });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md ${message.isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
          <h3 className="font-bold">{message.title}</h3>
          <p>{message.description}</p>
        </div>
      )}
      <CalendarComponent
        mode="single"
        selected={date}
        onSelect={(newDate) => {
          if (newDate) {
            setDate(newDate);
          }
        }}
        className="rounded-md border"
      />
      
      {/* 您可以在這裡添加其他内容，例如日期显示 */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h3 className="text-lg font-semibold">
          {format(date, 'yyyy年M月d日 EEEE', { locale: zhTW })}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          選擇日期來查看您的行程
        </p>
      </div>
      
      {/* 替代按鈕，如果需要的話 */}
      <div className="mt-4">
        <Button onClick={() => window.location.href = '/calendar'} className="w-full">
          前往行事曆頁面
        </Button>
      </div>
    </div>
  );
};

// SlideOutMenu Component
const SlideOutMenu = ({ isOpen, onClose, activeMenu }) => {
  const calendarItems = [
    { 
      icon: Info, 
      text: '每日事項', 
      href: '/calendar/daily',
      color: 'text-blue-500'
    },
    { 
      icon: Calendar, 
      text: '月曆總覽', 
      href: '/calendar/monthly',
      color: 'text-green-500'
    },
    {
      icon: Plus,
      text: '新增事項',
      href: '/calendar/new',
      color: 'text-purple-500'
    }
  ];

  const readingItems = [
    { 
      icon: BookOpen, 
      text: '閱讀', 
      href: '/reading',
      color: 'text-green-500'
    },
    { 
      icon: Camera, 
      text: '相機', 
      href: '/camera',
      color: 'text-blue-500'
    },
    { 
      icon: Music, 
      text: '音樂', 
      href: '/music',
      color: 'text-purple-500'
    }
  ];

  const menuItems = activeMenu === 'calendar' ? calendarItems : readingItems;

  return (
    <>
      {/* Mobile Version - Fullscreen */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <div 
          className={`absolute inset-y-0 right-0 w-full bg-white dark:bg-gray-800 
            shadow-lg transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {activeMenu === 'calendar' ? '行事曆' : '快速功能'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="h-[calc(100vh-57px)] overflow-y-auto overscroll-contain">
            <MenuContent items={menuItems} activeMenu={activeMenu} onClose={onClose} />
          </div>
        </div>
      </div>

      {/* Desktop Version */}
      <div 
        className={`hidden lg:block fixed top-0 right-0 h-full z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="w-80 h-full bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {activeMenu === 'calendar' ? '行事曆' : '快速功能'}
              </h2>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-73px)]">
            <MenuContent items={menuItems} activeMenu={activeMenu} onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
};

// FloatingButton Component
const FloatingButton = ({ imageToggle, onClick }) => (
  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 
        flex items-center justify-center shadow-lg 
        transition-all duration-200 hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      {imageToggle ? (
        <Pencil className="w-6 h-6 text-white" />
      ) : (
        <ImageIcon className="w-6 h-6 text-white" />
      )}
    </button>
  </div>
);

// BottomNav Component
const BottomNav = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const [imageToggle, setImageToggle] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Route change listener
  useEffect(() => {
    setIsMenuOpen(false);
    setImageToggle(false);
    setActiveMenu(null);
  }, [pathname]);

  // User data fetching
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
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

    const handleUserStateChanged = () => {
      fetchUser();
    };

    window.addEventListener('userStateChanged', handleUserStateChanged);

    return () => {
      window.removeEventListener('userStateChanged', handleUserStateChanged);
    };
  }, [fetchUser]);

  // Handle image toggle
  const handleImageToggle = () => {
    setImageToggle(!imageToggle);
  };

  // Handle nav item click
  const handleNavItemClick = (menu) => {
    if (activeMenu === menu && isMenuOpen) {
      setIsMenuOpen(false);
      setActiveMenu(null);
      setImageToggle(false);
    } else {
      setIsMenuOpen(true);
      setActiveMenu(menu);
      setImageToggle(true);
    }
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <>
      <nav className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-900 shadow-lg rounded-full z-40">
        <div className="max-w-screen-xl mx-auto px-4 relative">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center justify-around w-full">
              <NavItem 
                href="/" 
                Icon={Home} 
                text="首頁" 
                isActive={pathname === '/'} 
              />
              <NavItem 
                href="/settings" 
                Icon={Settings} 
                text="設定" 
                isActive={pathname === '/settings'}
              />
              <div className="w-16" /> {/* Spacer for floating button */}
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader className="animate-spin h-6 w-6 text-gray-700 dark:text-gray-300" />
                  <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">載入中</span>
                </div>
              ) : (
                <Link 
                  href="/personalprofile" 
                  className="flex flex-col items-center"
                >
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
              )}
              <NavItem 
                href="#" 
                Icon={Calendar} 
                text="行事曆" 
                onClick={() => handleNavItemClick('calendar')}
                isActive={activeMenu === 'calendar' && isMenuOpen}
              />
            </div>
          </div>
          <FloatingButton 
            imageToggle={imageToggle}
            onClick={handleImageToggle}
          />
        </div>
      </nav>

      <SlideOutMenu 
        isOpen={isMenuOpen} 
        onClose={() => {
          setIsMenuOpen(false);
          setImageToggle(false);
          setActiveMenu(null);
        }} 
        activeMenu={activeMenu}
      />
    </>
  );
};

export default BottomNav;