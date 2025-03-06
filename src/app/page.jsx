"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';

const Page = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState({});
  const [tomorrowSchedule, setTomorrowSchedule] = useState({});
  const [activeDay, setActiveDay] = useState("today"); 
  const [message, setMessage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  // 手動設定學期列表
  const semesterList = [
    "113-1", "113-2", 
    "114-1", "114-2", 
    "115-1", "115-2", 
    "116-1", "116-2", 
    "117-1", "117-2"
  ];
  
  const [semesters, setSemesters] = useState(semesterList);
  const [activeSemester, setActiveSemester] = useState("113-1");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [existingCourses, setExistingCourses] = useState([]);
  
  const weekdays = ['週一', '週二', '週三', '週四', '週五'];
  const timeSlots = [
    '08:00-08:50',
    '08:55-09:45',
    '09:55-10:45',
    '10:50-11:40',
    '11:50-12:40',
    '12:45-13:35',
    '13:40-14:30',
    '14:40-15:30',
    '15:35-16:25'
  ];

  const getDayOfWeek = (day) => {
    return weekdays.indexOf(day) + 1;
  };

  // 判斷課程類型的輔助函數
  const determineCourseType = (title) => {
    const requiredCourses = ['國文', '英文', '數學', '物理', '化學', '歷史', '地理'];
    if (requiredCourses.includes(title)) {
      return 1; // 1 表示必修
    }
    return 2; // 2 表示選修（預設值）
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsername(userData.username);
          setActiveSemester("113-1"); // 預設使用 113-1 學期
        }
      } catch (err) {
        console.error('初始化數據錯誤:', err);
        showMessage("錯誤", "獲取數據失敗", true);
      }
    };
    initializeData();
    checkLoginStatus();
  }, []);

  // 當學期變更時重新獲取課程
  useEffect(() => {
    if (activeSemester) {
      fetchCourses();
      fetchExistingCourses();
    }
  }, [activeSemester]);

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
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取資料庫中已存在的課程名稱
  const fetchExistingCourses = async () => {
    try {
      const response = await fetch(`/api/schedule-event?semester=${activeSemester}`);
      if (!response.ok) throw new Error('獲取課程列表失敗');
      
      const data = await response.json();
      
      // 提取所有課程名稱並去重
      const courses = [...new Set(data.schedules.map(s => s.title))].filter(Boolean);
      setExistingCourses(courses);
      
      console.log('從資料庫獲取的課程列表:', courses);
    } catch (error) {
      console.error('獲取已存在課程失敗:', error);
    }
  };

  const fetchCourses = async () => {
    if (!activeSemester) return;
    
    try {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      
      // 獲取今天的課程，添加學期參數
      const todayResponse = await fetch(`/api/schedule-event?date=${format(today, 'yyyy-MM-dd')}&semester=${activeSemester}`);
      if (!todayResponse.ok) throw new Error('獲取今天課程失敗');
      const todayData = await todayResponse.json();
      
      // 獲取明天的課程，添加學期參數
      const tomorrowResponse = await fetch(`/api/schedule-event?date=${format(tomorrow, 'yyyy-MM-dd')}&semester=${activeSemester}`);
      if (!tomorrowResponse.ok) throw new Error('獲取明天課程失敗');
      const tomorrowData = await tomorrowResponse.json();
      
      // 處理今天的課程資料
      const formattedTodaySchedule = formatScheduleData(todayData.schedules || []);
      setTodaySchedule(formattedTodaySchedule);
      
      // 處理明天的課程資料
      const formattedTomorrowSchedule = formatScheduleData(tomorrowData.schedules || []);
      setTomorrowSchedule(formattedTomorrowSchedule);
    } catch (error) {
      console.error('獲取課程錯誤:', error);
      showMessage("錯誤", "獲取課程失敗", true);
    }
  };

  const formatScheduleData = (schedules) => {
    const formattedSchedule = {};
    schedules.forEach(schedule => {
      const dayIndex = schedule.day_of_week - 1;
      if (dayIndex < 0 || dayIndex >= weekdays.length) {
        console.warn(`無效的星期: ${schedule.day_of_week}`);
        return;
      }
      
      const day = weekdays[dayIndex];
      const timeKey = `${schedule.start_time.slice(0, 5)}-${schedule.end_time.slice(0, 5)}`;
      const key = `${day}-${timeKey}`;
      
      formattedSchedule[key] = {
        id: schedule.id,
        name: schedule.title,
        room: schedule.classroom || '',
        classroom: schedule.classroom || '',
        description: schedule.description,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        day_of_week: schedule.day_of_week,
        semester: schedule.semester,
        credits: schedule.credits,
        course_type: schedule.course_type
      };
    });
    return formattedSchedule;
  };

  const showMessage = (title, description, isError = false) => {
    setMessage({ title, description, isError });
    setTimeout(() => setMessage(null), 3000);
  };

  // 處理時間段選擇變更
  const handleTimeSlotChange = (timeSlot) => {
    setSelectedTimeSlots(current => {
      if (current.includes(timeSlot)) {
        return current.filter(t => t !== timeSlot);
      } else {
        return [...current, timeSlot];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const dayOfWeek = getDayOfWeek(formData.get('day'));
    const title = formData.get('title');
    
    // 如果沒有選擇任何時間段，顯示錯誤
    if (selectedTimeSlots.length === 0) {
      showMessage("錯誤", "請至少選擇一個時間段", true);
      return;
    }

    // 如果選擇了多個時間段，創建多個課程記錄
    try {
      for (const timeSlot of selectedTimeSlots) {
        const [startTime, endTime] = timeSlot.split('-');
        
        // 創建課程數據對象
        const courseData = {
          type: 'schedule',
          title: title,
          description: formData.get('description') || '',
          classroom: formData.get('room'),
          day_of_week: dayOfWeek,
          start_time: `${startTime}:00`,
          end_time: `${endTime}:00`,
          date: format(activeDay === "today" ? new Date() : addDays(new Date(), 1), 'yyyy-MM-dd'),
          semester: formData.get('semester') || activeSemester,
          credits: formData.get('credits') ? parseInt(formData.get('credits')) : null,
          course_type: determineCourseType(title)
        };
        
        console.log('Prepared course data:', courseData);
      
        const method = isEditing ? 'PUT' : 'POST';
        const body = {
          ...courseData,
          id: isEditing ? currentCourse.id : undefined
        };
      
        const response = await fetch('/api/schedule-event', {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '保存課程失敗');
        }
      }
      
      // 所有時間段都添加完成後，刷新課表並關閉對話框
      await fetchCourses();
      await fetchExistingCourses();
      showMessage("成功", `${isEditing ? '更新' : '添加'}課程成功`);
      setIsAddingOpen(false);
      setIsEditing(false);
      setCurrentCourse(null);
      setSelectedTimeSlots([]);
    } catch (error) {
      console.error('保存課程錯誤:', error);
      showMessage("錯誤", `${isEditing ? '更新' : '添加'}課程失敗: ${error.message}`, true);
    }
  };

  const handleDelete = (day, time) => {
    const schedule = activeDay === "today" ? todaySchedule : tomorrowSchedule;
    const key = `${day}-${time}`;
    setDeleteConfirmation({ 
      key, 
      courseName: schedule[key].name,
      id: schedule[key].id,
      type: 'schedule'
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      const response = await fetch(`/api/schedule-event?type=${deleteConfirmation.type}&id=${deleteConfirmation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('刪除課程失敗');
      
      await fetchCourses();
      await fetchExistingCourses();
      showMessage("成功", "課程已刪除");
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('刪除課程錯誤:', error);
      showMessage("錯誤", "刪除課程失敗", true);
    }
  };

  const handleEdit = (day, time) => {
    const schedule = activeDay === "today" ? todaySchedule : tomorrowSchedule;
    const key = `${day}-${time}`;
    const course = schedule[key];
    
    setCurrentCourse({
      ...course,
      day,
      time: `${course.start_time.slice(0, 5)}-${course.end_time.slice(0, 5)}`,
      room: course.room || course.classroom,
      semester: course.semester,
      credits: course.credits
    });
    
    setSelectedTimeSlots([`${course.start_time.slice(0, 5)}-${course.end_time.slice(0, 5)}`]);
    
    setIsEditing(true);
    setIsAddingOpen(true);
  };

  const openAddCourseDialog = () => {
    setIsEditing(false);
    setCurrentCourse(null);
    setSelectedTimeSlots([]);
    setIsAddingOpen(true);
  };

  const displaySchedule = activeDay === "today" ? todaySchedule : tomorrowSchedule;
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const todayLabel = `今天 (${format(today, 'MM/dd')})`;
  const tomorrowLabel = `明天 (${format(tomorrow, 'MM/dd')})`;

  const getCourseTypeName = (type) => {
    switch(type) {
      case 1: return '必修';
      case 2: return '選修';
      case 3: return '通識';
      default: return '其他';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container p-0">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md ${message.isError ? 'bg-red-500' : 'bg-green-500'} text-white z-50`}>
          <h3 className="font-bold">{message.title}</h3>
          <p>{message.description}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{username ? `${username} 的課表` : '課表'}</h2>
        <Button 
          onClick={openAddCourseDialog}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          添加課程
        </Button>
      </div>

      {/* 學期選擇器 */}
      <div className="mb-4">
        <Label htmlFor="semester-selector" className="mr-2">學期:</Label>
        <Select 
          value={activeSemester} 
          onValueChange={setActiveSemester}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="選擇學期" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map(semester => (
              <SelectItem key={semester} value={semester}>{semester}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 簡易標籤切換 */}
      <div className="grid grid-cols-2 gap-2 mb-4 max-w-md mx-auto">
        <Button 
          onClick={() => setActiveDay("today")} 
          variant={activeDay === "today" ? "default" : "outline"}
          className="w-full"
        >
          {todayLabel}
        </Button>
        <Button 
          onClick={() => setActiveDay("tomorrow")} 
          variant={activeDay === "tomorrow" ? "default" : "outline"}
          className="w-full"
        >
          {tomorrowLabel}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-50 w-16">時間</th>
                  {weekdays.map(day => (
                    <th key={day} className="p-2 border bg-gray-50 text-center ">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="p-2 border text-sm font-medium bg-gray-50">
                      {time}
                    </td>
                    {weekdays.map(day => {
                      const classInfo = displaySchedule[`${day}-${time}`];
                      return (
                        <td key={`${day}-${time}`} className="p-2 border text-center relative group">
                          {classInfo ? (
                            <div>
                              <div className="font-medium text-blue-600">
                                {classInfo.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {classInfo.room}教室
                              </div>
                              {classInfo.description && (
                                <div className="text-xs text-gray-500">
                                  {classInfo.description}
                                </div>
                              )}
                              {classInfo.credits && (
                                <div className="text-xs text-gray-500">
                                  {classInfo.credits}學分
                                </div>
                              )}
                              {classInfo.course_type && (
                                <div className="text-xs text-gray-500">
                                  {getCourseTypeName(classInfo.course_type)}
                                </div>
                              )}
                              <div className="absolute top-0 right-0 hidden group-hover:flex gap-1 p-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(day, time)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(day, time)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingOpen} onOpenChange={setIsAddingOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? '編輯課程' : '添加新課程'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* 課程名稱選擇 - 使用 datalist 實現自動完成 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">課程名稱</Label>
                <div className="col-span-3">
                  <Input
                    id="title"
                    name="title"
                    list="course-options"
                    defaultValue={currentCourse?.name}
                    placeholder="選擇或輸入課程名稱"
                    className="w-full"
                    required
                  />
                  <datalist id="course-options">
                    {existingCourses.map(course => (
                      <option key={course} value={course}>
                        {course} {determineCourseType(course) === 1 ? '(必修)' : ''}
                      </option>
                    ))}
                  </datalist>
                  {/* 顯示是否為必修的指示 */}
                  <div className="text-xs text-gray-500 mt-1">
                    <span>提示: 國文、英文、數學等將自動標記為必修課程</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="room" className="text-right">教室</Label>
                <Input
                  id="room"
                  name="room"
                  defaultValue={currentCourse?.room}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">描述</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={currentCourse?.description}
                  className="col-span-3 min-h-[60px] p-2 border rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="semester" className="text-right">學期</Label>
                <Select name="semester" defaultValue={currentCourse?.semester || activeSemester}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="選擇學期" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(semester => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">學分</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  min="0"
                  max="10"
                  defaultValue={currentCourse?.credits}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="day" className="text-right">星期</Label>
                <Select name="day" defaultValue={currentCourse?.day}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="選擇星期" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdays.map(day => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 時間段多選 - 使用按鈕實現 */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">時間段</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  {timeSlots.map(timeSlot => {
                    const isSelected = selectedTimeSlots.includes(timeSlot);
                    return (
                      <Button
                        key={timeSlot}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="justify-start px-2 py-1 h-8"
                        onClick={() => handleTimeSlotChange(timeSlot)}
                      >
                        {isSelected && <Check className="mr-2 h-3 w-4" />}
                        <span className="text-xs">{timeSlot}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? '更新' : '添加'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            確定要刪除課程「{deleteConfirmation?.courseName}」嗎？此操作無法撤銷。
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>確認刪除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;