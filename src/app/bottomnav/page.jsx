'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { 
  Home, Info, Calendar, Settings, Loader, UserCircle, 
  XIcon, BookOpen, Camera, Music, ChevronRight, Plus,
  ImageIcon, Pencil, Edit, Trash 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { format, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// NavItem Component (unchanged)
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
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [showDayDetailsDialog, setShowDayDetailsDialog] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [itemType, setItemType] = useState('schedule');
  const [currentItem, setCurrentItem] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const showMessage = (title, description, isError = false) => {
    setMessage({ title, description, isError });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (date) {
      fetchData(date);
    }
  }, [date]);

  const fetchData = async (selectedDate) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/schedule-event?date=${formattedDate}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSchedules(data.schedules || []);
      setEvents(data.events || []);
      setShowDayDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage("錯誤", `無法獲取數據：${error.message}`, true);
    }
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const itemData = Object.fromEntries(formData.entries());

    try {
      const method = isEditingItem ? 'PUT' : 'POST';
      const body = {
        type: itemType,
        ...itemData,
        date: format(date, 'yyyy-MM-dd'),
        day_of_week: itemType === 'schedule' ? parseInt(itemData.day_of_week) : null,
        id: currentItem?.id
      };

      const response = await fetch('/api/schedule-event', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setIsAddingItem(false);
      setIsEditingItem(false);
      setCurrentItem(null);
      fetchData(date);
      showMessage("成功", `${isEditingItem ? '更新' : '添加'}${itemType === 'schedule' ? '課程' : '行程'}成功。`);
    } catch (error) {
      console.error('Error submitting item:', error);
      showMessage("錯誤", `${isEditingItem ? '更新' : '添加'}${itemType === 'schedule' ? '課程' : '行程'}失敗：${error.message}`, true);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmation) return;

    try {
      const response = await fetch(`/api/schedule-event?type=${deleteConfirmation.type}&id=${deleteConfirmation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      fetchData(date);
      showMessage("成功", `刪除${deleteConfirmation.type === 'schedule' ? '課程' : '行程'}成功。`);
    } catch (error) {
      console.error('Error deleting item:', error);
      showMessage("錯誤", `刪除失敗：${error.message}`, true);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const ItemForm = () => (
    <form onSubmit={handleSubmitItem}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">標題</Label>
          <Input id="title" name="title" defaultValue={currentItem?.title} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">描述</Label>
          <textarea 
            id="description" 
            name="description" 
            defaultValue={currentItem?.description} 
            className="col-span-3 w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        {itemType === 'schedule' && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day_of_week" className="text-right">星期幾</Label>
            <Select 
              name="day_of_week" 
              defaultValue={currentItem?.day_of_week?.toString() || getDay(date).toString()}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇星期" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">星期日</SelectItem>
                <SelectItem value="1">星期一</SelectItem>
                <SelectItem value="2">星期二</SelectItem>
                <SelectItem value="3">星期三</SelectItem>
                <SelectItem value="4">星期四</SelectItem>
                <SelectItem value="5">星期五</SelectItem>
                <SelectItem value="6">星期六</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="start_time" className="text-right">開始時間</Label>
          <Input type="time" id="start_time" name="start_time" defaultValue={currentItem?.start_time} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="end_time" className="text-right">結束時間</Label>
          <Input type="time" id="end_time" name="end_time" defaultValue={currentItem?.end_time} className="col-span-3" required />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{isEditingItem ? '更新' : '添加'}</Button>
      </DialogFooter>
    </form>
  );

  const getSchedulesForDay = (selectedDate) => {
    const dayOfWeek = getDay(selectedDate);
    return schedules.filter(schedule => schedule.day_of_week === dayOfWeek);
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
            fetchData(newDate);
          }
        }}
        className="rounded-md border"
      />

      {/* Day Details Dialog */}
      <Dialog open={showDayDetailsDialog} onOpenChange={setShowDayDetailsDialog}>
        <DialogContent className="sm:max-w-[450px] h-[70vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{format(date, 'yyyy年M月d日')}</DialogTitle>
          </DialogHeader>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">課程</h3>
            <div className="max-h-[200px] overflow-y-auto">
              {getSchedulesForDay(date).length > 0 ? (
                getSchedulesForDay(date).map((schedule) => (
                  <div key={schedule.id} className="mb-2 p-2 border dark:border-gray-600 rounded">
                    <div className="font-bold">{schedule.title}</div>
                    <div>{schedule.start_time} - {schedule.end_time}</div>
                    <div>{schedule.description}</div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => { setCurrentItem(schedule); setItemType('schedule'); setIsEditingItem(true); setIsAddingItem(true); }} className="mr-2">
                        <Edit className="mr-2 h-4 w-4" /> 編輯
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirmation({ ...schedule, type: 'schedule' })}>
                        <Trash className="mr-2 h-4 w-4" /> 刪除
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p>今天沒有課程</p>
              )}
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">行程</h3>
            <div className="max-h-[200px] overflow-y-auto">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="mb-2 p-2 border dark:border-gray-600 rounded">
                    <div className="font-bold">{event.title}</div>
                    <div>{event.start_time} - {event.end_time}</div>
                    <div>{event.description}</div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => { setCurrentItem(event); setItemType('event'); setIsEditingItem(true); setIsAddingItem(true); }} className="mr-2">
                        <Edit className="mr-2 h-4 w-4" /> 編輯
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirmation({ ...event, type: 'event' })}>
                        <Trash className="mr-2 h-4 w-4" /> 刪除
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p>今天沒有行程</p>
              )}
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button onClick={() => { setIsAddingItem(true); setItemType('schedule'); setIsEditingItem(false); setCurrentItem(null); }} className="text-sm">
              <Plus className="mr-2 h-4 w-4" /> 添加課程
            </Button>
            <Button onClick={() => { setIsAddingItem(true); setItemType('event'); setIsEditingItem(false); setCurrentItem(null); }} className="text-sm">
              <Plus className="mr-2 h-4 w-4" /> 添加行程
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="sm:max-w-[350px] h-[60vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{isEditingItem ? '編輯' : '添加'}{itemType === 'schedule' ? '課程' : '行程'}</DialogTitle>
          </DialogHeader>
          <ItemForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent className="sm:max-w-[350px] h-auto">
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            您確定要刪除這個{deleteConfirmation?.type === 'schedule' ? '課程' : '行程'}嗎？此操作無法撤銷。
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDeleteItem}>確認刪除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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