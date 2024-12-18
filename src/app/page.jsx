"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, getDay, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Plus, Edit, Trash } from 'lucide-react';
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

function CalendarScheduleEventManager() {
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [itemType, setItemType] = useState('schedule');
  const [currentItem, setCurrentItem] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    if (date) {
      fetchData(date);
    }
  }, [date]);

  const showMessage = (title, description, isError = false) => {
    setMessage({ title, description, isError });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchData = async (selectedDate) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log(`Fetching data for date: ${formattedDate}`);
      const response = await fetch(`/api/schedule-event?date=${formattedDate}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSchedules(data.schedules || []);
      setEvents(data.events || []);
      setShowPopup(true);
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
      <Calendar
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


     
    </div>
  );
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(!!data.username);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return null; // 或者你可以返回一个加载指示器
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">課表與行事曆</h1>
      <CalendarScheduleEventManager />
    </div>
  );
}