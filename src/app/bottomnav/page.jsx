'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { 
  Home, Info, Calendar, Settings, Loader, UserCircle, 
  XIcon, BookOpen, Camera, Music, ChevronRight, Plus,
  ImageIcon, Pencil, Bookmark, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// 學分進度條組件
const ProgressBar = ({ current, total, color }) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-1">
      <div 
        className={`h-4 rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{current} / {total} 學分</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
};

// SemesterCard 組件
const SemesterCard = ({ semester, credits }) => {
  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-2">{semester}</h3>
      
      <div className="space-y-4 mt-3">
        <div>
          <h4 className="font-medium mb-1">必修課程</h4>
          <ProgressBar 
            current={credits.required.current} 
            total={credits.required.total} 
            color="bg-blue-500" 
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-1">選修課程</h4>
          <ProgressBar 
            current={credits.elective.current} 
            total={credits.elective.total} 
            color="bg-green-500" 
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-1">通識課程</h4>
          <ProgressBar 
            current={credits.general.current} 
            total={credits.general.total} 
            color="bg-purple-500" 
          />
        </div>
        
        <div className="pt-2 border-t dark:border-gray-700">
          <h4 className="font-medium mb-1">總學分</h4>
          <ProgressBar 
            current={
              credits.required.current + 
              credits.elective.current + 
              credits.general.current
            } 
            total={
              credits.required.total + 
              credits.elective.total + 
              credits.general.total
            } 
            color="bg-yellow-500" 
          />
        </div>
      </div>
    </div>
  );
};

// MenuContent Component - 學分追蹤器
const MenuContent = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [message, setMessage] = useState(null);

  // 模擬學分數據
  const creditData = {
    '111-1': {
      required: { current: 12, total: 15 },
      elective: { current: 6, total: 9 },
      general: { current: 4, total: 6 },
    },
    '111-2': {
      required: { current: 14, total: 15 },
      elective: { current: 8, total: 9 },
      general: { current: 5, total: 6 },
    },
    '112-1': {
      required: { current: 10, total: 15 },
      elective: { current: 7, total: 9 },
      general: { current: 3, total: 6 },
    },
    '112-2': {
      required: { current: 8, total: 15 },
      elective: { current: 4, total: 9 },
      general: { current: 2, total: 6 },
    }
  };
  
  // 計算總學分
  const calculateTotal = () => {
    let requiredCurrent = 0, requiredTotal = 0;
    let electiveCurrent = 0, electiveTotal = 0;
    let generalCurrent = 0, generalTotal = 0;
    
    Object.values(creditData).forEach(semesterData => {
      requiredCurrent += semesterData.required.current;
      requiredTotal += semesterData.required.total;
      electiveCurrent += semesterData.elective.current;
      electiveTotal += semesterData.elective.total;
      generalCurrent += semesterData.general.current;
      generalTotal += semesterData.general.total;
    });
    
    return {
      required: { current: requiredCurrent, total: requiredTotal },
      elective: { current: electiveCurrent, total: electiveTotal },
      general: { current: generalCurrent, total: generalTotal }
    };
  };

  const showMessage = (title, description, isError = false) => {
    setMessage({ title, description, isError });
    setTimeout(() => setMessage(null), 5000);
  };

  // 過濾要顯示的學期
  const getSemestersToShow = () => {
    if (selectedYear === 'all') {
      // 如果選了 'all'，返回所有學期
      return Object.entries(creditData).map(([semester, credits]) => (
        <SemesterCard key={semester} semester={semester} credits={credits} />
      ));
    } else {
      // 過濾出指定學年的學期
      return Object.entries(creditData)
        .filter(([semester]) => semester.startsWith(selectedYear))
        .map(([semester, credits]) => (
          <SemesterCard key={semester} semester={semester} credits={credits} />
        ));
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-full">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md ${message.isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
          <h3 className="font-bold">{message.title}</h3>
          <p>{message.description}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <GraduationCap className="mr-2 h-6 w-6" />
          學分追蹤
        </h2>
        
        <div className="mb-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選擇學年" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部學期</SelectItem>
              <SelectItem value="111">111學年</SelectItem>
              <SelectItem value="112">112學年</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* 總覽卡片 */}
        {selectedYear === 'all' && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2 text-blue-800 dark:text-blue-300">學分總覽</h3>
            <div className="space-y-4">
              <ProgressBar 
                current={Object.values(calculateTotal()).reduce((sum, type) => sum + type.current, 0)} 
                total={Object.values(calculateTotal()).reduce((sum, type) => sum + type.total, 0)} 
                color="bg-blue-600" 
              />
              
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                  <p className="font-medium">必修</p>
                  <p>{calculateTotal().required.current}/{calculateTotal().required.total}</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded">
                  <p className="font-medium">選修</p>
                  <p>{calculateTotal().elective.current}/{calculateTotal().elective.total}</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded">
                  <p className="font-medium">通識</p>
                  <p>{calculateTotal().general.current}/{calculateTotal().general.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 各學期學分卡片 */}
        <div>
          <h3 className="font-bold text-lg mb-3">
            {selectedYear === 'all' ? '各學期學分' : `${selectedYear}學年學分`}
          </h3>
          {getSemestersToShow()}
        </div>
      </div>
      
      {/* 額外功能按鈕 */}
      <div className="mt-6 flex gap-2">
        <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
          <BookOpen className="mr-2 h-4 w-4" />
          查看課程清單
        </Button>
        <Button className="flex-1 bg-green-500 hover:bg-green-600">
          <Plus className="mr-2 h-4 w-4" />
          添加修課記錄
        </Button>
      </div>
    </div>
  );
};

// SlideOutMenu Component
const SlideOutMenu = ({ isOpen, onClose, activeMenu }) => {
  const creditItems = [
    { 
      icon: GraduationCap, 
      text: '學分總覽', 
      href: '/credit/overview',
      color: 'text-blue-500'
    },
    { 
      icon: BookOpen, 
      text: '課程清單', 
      href: '/credit/courses',
      color: 'text-green-500'
    },
    {
      icon: Plus,
      text: '添加課程',
      href: '/credit/add',
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

  const menuItems = activeMenu === 'credit' ? creditItems : readingItems;

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
              {activeMenu === 'credit' ? '學分追蹤' : '快速功能'}
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
                {activeMenu === 'credit' ? '學分追蹤' : '快速功能'}
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
                Icon={GraduationCap} 
                text="學分" 
                onClick={() => handleNavItemClick('credit')}
                isActive={activeMenu === 'credit' && isMenuOpen}
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