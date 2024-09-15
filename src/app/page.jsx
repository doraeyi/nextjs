"use client";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
      const response = await fetch(`/api/schedule-event?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      const data = await response.json();
      if (response.ok) {
        setSchedules(data.schedules);
        setEvents(data.events);
        setShowPopup(true);
      } else {
        throw new Error(data.error || '獲取數據失敗');
      }
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
      const url = '/api/schedule-event';
      const method = isEditingItem ? 'PUT' : 'POST';
      const body = {
        ...itemData,
        type: itemType,
        date: format(date, 'yyyy-MM-dd'),
        id: currentItem?.id
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAddingItem(false);
        setIsEditingItem(false);
        setCurrentItem(null);
        fetchData(date);
        showMessage("成功", `${isEditingItem ? '更新' : '添加'}${itemType === 'schedule' ? '課程' : '行程'}成功。`);
      } else {
        throw new Error(data.error || `Failed to ${isEditingItem ? 'update' : 'add'} item`);
      }
    } catch (error) {
      console.error('Error submitting item:', error);
      showMessage("錯誤", `${isEditingItem ? '更新' : '添加'}${itemType === 'schedule' ? '課程' : '行程'}失敗：${error.message}`, true);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmation) return;

    try {
      console.log(`Attempting to delete item: ${JSON.stringify(deleteConfirmation)}`);
      const response = await fetch(`/api/schedule-event?type=${deleteConfirmation.type}&id=${deleteConfirmation.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Successfully deleted item with ID: ${deleteConfirmation.id}`);
        fetchData(date);
        showMessage("成功", `刪除${deleteConfirmation.type === 'schedule' ? '課程' : '行程'}成功。`);
      } else {
        throw new Error(data.error || 'Failed to delete item');
      }
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
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startTime" className="text-right">開始時間</Label>
          <Input type="time" id="startTime" name="startTime" defaultValue={currentItem?.start_time} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endTime" className="text-right">結束時間</Label>
          <Input type="time" id="endTime" name="endTime" defaultValue={currentItem?.end_time} className="col-span-3" required />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{isEditingItem ? '更新' : '添加'}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
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
          setDate(newDate);
          if (newDate) {
            fetchData(newDate);
          }
        }}
        className="rounded-md border"
      />

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-[350px] h-[70vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{date && format(date, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">課程</h3>
            <div className="max-h-[200px] overflow-y-auto">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
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
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">行程</h3>
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

      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="sm:max-w-[350px] h-[60vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{isEditingItem ? '編輯' : '添加'}{itemType === 'schedule' ? '課程' : '行程'}</DialogTitle>
          </DialogHeader>
          <ItemForm />
        </DialogContent>
      </Dialog>

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
}

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">課表與行事曆</h1>
      <CalendarScheduleEventManager />
    </div>
  );
}
