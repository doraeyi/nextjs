"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { Edit, Trash, Check, Calendar, Eye } from 'lucide-react';
import { format, addDays } from 'date-fns';

const Page = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [allSchedule, setAllSchedule] = useState({});
  const [todaySchedule, setTodaySchedule] = useState({});
  const [tomorrowSchedule, setTomorrowSchedule] = useState({});
  const [activeDay, setActiveDay] = useState("today"); 
  const [message, setMessage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [viewMode, setViewMode] = useState("daily"); // "daily" or "all"
  
  // 手動設定學期列表
  const semesterList = [
    "113-1", "113-2", 
    "114-1", "114-2", 
    "115-1", "115-2", 
    "116-1", "116-2", 
    "117-1", "117-2"
  ];
  
  const [semesters, setSemesters] = useState(semesterList);
  const [activeSemester, setActiveSemester] = useState("113-2");
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

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const todayWeekday = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const tomorrowWeekday = tomorrow.getDay();
  // Map to our weekdays array (which is 0-indexed with Monday as 0)
  const todayWeekdayIndex = todayWeekday === 0 ? null : todayWeekday - 1; // null if Sunday
  const tomorrowWeekdayIndex = tomorrowWeekday === 0 ? null : tomorrowWeekday - 1; // null if Sunday
  const todayWeekdayName = todayWeekdayIndex !== null ? weekdays[todayWeekdayIndex] : null;
  const tomorrowWeekdayName = tomorrowWeekdayIndex !== null ? weekdays[tomorrowWeekdayIndex] : null;

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
          setActiveSemester("113-2"); // 預設使用 113-1 學期
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
      fetchAllCourses();
      fetchDailySchedules();
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

  // 獲取所有學期的課程
  const fetchAllCourses = async () => {
    try {
      const response = await fetch(`/api/schedule-event?semester=${activeSemester}`);
      if (!response.ok) throw new Error('獲取課程失敗');
      
      const data = await response.json();
      const formattedSchedule = formatScheduleData(data.schedules || []);
      setAllSchedule(formattedSchedule);
    } catch (error) {
      console.error('獲取所有課程錯誤:', error);
      showMessage("錯誤", "獲取課程失敗", true);
    }
  };

  // 獲取今天和明天的課程
  const fetchDailySchedules = async () => {
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
      await fetchAllCourses();
      await fetchDailySchedules();
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

  const handleDelete = (day, time, schedule) => {
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
      
      await fetchAllCourses();
      await fetchDailySchedules();
      await fetchExistingCourses();
      showMessage("成功", "課程已刪除");
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('刪除課程錯誤:', error);
      showMessage("錯誤", "刪除課程失敗", true);
    }
  };

  const handleEdit = (day, time, schedule) => {
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

  const getCourseTypeName = (type) => {
    switch(type) {
      case 1: return '必修';
      case 2: return '選修';
      case 3: return '通識';
      default: return '其他';
    }
  };

  // 判斷是否為今天或明天的課程
  const isTodayCourse = (day) => {
    return todayWeekdayName === day;
  };
  
  const isTomorrowCourse = (day) => {
    return tomorrowWeekdayName === day;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${message.isError ? 'bg-red-500' : 'bg-green-500'} text-white z-50 transition-opacity duration-300`}>
          <h3 className="font-bold">{message.title}</h3>
          <p>{message.description}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold">{username ? `${username} 的課表` : '課表'}</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setViewMode("daily")}
            variant={viewMode === "daily" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span>每日檢視</span>
          </Button>
          <Button 
            onClick={() => setViewMode("all")}
            variant={viewMode === "all" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            <span>全部課表</span>
          </Button>
          <Button 
            onClick={openAddCourseDialog}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            添加課程
          </Button>
        </div>
      </div>

      {/* 學期選擇器 */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Label htmlFor="semester-selector" className="font-medium">學期:</Label>
          <Select 
            value={activeSemester} 
            onValueChange={setActiveSemester}
          >
            <SelectTrigger className="w-32 bg-white">
              <SelectValue placeholder="選擇學期" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map(semester => (
                <SelectItem key={semester} value={semester}>{semester}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500 ml-auto">
            目前顯示 {activeSemester} 學期課表
          </div>
        </div>
      </div>

      {viewMode === "daily" ? (
        <>
          {/* 每日檢視 - 今天/明天切換 */}
          <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
            <Button 
              onClick={() => setActiveDay("today")} 
              variant={activeDay === "today" ? "default" : "outline"}
              className={`w-full font-medium text-lg ${activeDay === "today" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              {`今天 (${format(today, 'MM/dd')})`}
            </Button>
            <Button 
              onClick={() => setActiveDay("tomorrow")} 
              variant={activeDay === "tomorrow" ? "default" : "outline"}
              className={`w-full font-medium text-lg ${activeDay === "tomorrow" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              {`明天 (${format(tomorrow, 'MM/dd')})`}
            </Button>
          </div>

          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 py-4">
              <CardTitle className="text-center text-xl">
                {activeDay === "today" ? 
                  `今日課表 (${format(today, 'yyyy/MM/dd')}) ${todayWeekdayName ? todayWeekdayName : '無課程'}` : 
                  `明日課表 (${format(tomorrow, 'yyyy/MM/dd')}) ${tomorrowWeekdayName ? tomorrowWeekdayName : '無課程'}`
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 border bg-gray-100 font-semibold w-32 sticky left-0 z-10 shadow-md">時間</th>
                      {weekdays.map(day => (
                        <th key={day} className={`p-3 border text-center font-semibold ${
                          (activeDay === "today" && isTodayCourse(day)) || 
                          (activeDay === "tomorrow" && isTomorrowCourse(day)) ? 
                          'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => {
                      const schedule = activeDay === "today" ? todaySchedule : tomorrowSchedule;
                      return (
                        <tr key={time}>
                          <td className="p-3 border text-sm font-medium bg-gray-50 sticky left-0 z-10 shadow-md">
                            {time}
                          </td>
                          {weekdays.map(day => {
                            const isHighlighted = 
                              (activeDay === "today" && isTodayCourse(day)) || 
                              (activeDay === "tomorrow" && isTomorrowCourse(day));
                            
                            const classInfo = schedule[`${day}-${time}`];
                            return (
                              <td 
                                key={`${day}-${time}`} 
                                className={`p-3 border text-center relative group ${
                                  isHighlighted ? 'bg-blue-50' : ''
                                } ${classInfo ? 'hover:bg-gray-50' : ''}`}
                              >
                                {classInfo ? (
                                 <div className="relative">
                                 <div className="font-medium text-blue-600">
                                   {classInfo.name}
                                 </div>
                                 <div className="text-sm text-gray-600">
                                   {classInfo.room}教室
                                 </div>
                                 {classInfo.description && (
                                   <div className="text-xs text-gray-500 mt-0.5">
                                     {classInfo.description}
                                   </div>
                                 )}
                                <div className="flex flex-col gap-1 mt-1 justify-center">
  {classInfo.credits && (
    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-center whitespace-nowrap">
      {classInfo.credits}學分
    </span>
  )}
  {classInfo.course_type && (
    <span className={`px-2 py-0.5 rounded-full text-center whitespace-nowrap ${
      classInfo.course_type === 1 ? 
        'bg-red-100 text-red-800' : 
        'bg-green-100 text-green-800'
    }`}>
      {getCourseTypeName(classInfo.course_type)}
    </span>
  )}
</div>     <div className="absolute top-0 right-0 hidden group-hover:flex gap-1 p-1 bg-white rounded shadow-sm">
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(day, time, schedule)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(day, time, schedule)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // 所有學期課表檢視
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 py-4">
            <CardTitle className="text-center text-xl">
              {activeSemester} 學期完整課表
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 border bg-gray-100 font-semibold w-32 sticky left-0 z-10 shadow-md">時間</th>
                    {weekdays.map(day => (
                      <th key={day} className={`p-3 border text-center font-semibold ${
                        isTodayCourse(day) ? 'bg-blue-100' : 
                        isTomorrowCourse(day) ? 'bg-green-50' : 'bg-gray-100'
                      }`}>
                        {day}
                        {isTodayCourse(day) && <div className="text-xs text-blue-600">今天</div>}
                        {isTomorrowCourse(day) && <div className="text-xs text-green-600">明天</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="p-3 border text-sm font-medium bg-gray-50 sticky left-0 z-10 shadow-md">
                        {time}
                      </td>
                      {weekdays.map(day => {
                        const isTodayCol = isTodayCourse(day);
                        const isTomorrowCol = isTomorrowCourse(day);
                        const classInfo = allSchedule[`${day}-${time}`];
                        
                        let bgColor = '';
                        if (isTodayCol) bgColor = 'bg-blue-50';
                        else if (isTomorrowCol) bgColor = 'bg-green-50';
                        
                        return (
                          <td 
                            key={`${day}-${time}`} 
                            className={`p-3 border text-center relative group ${bgColor} ${classInfo ? 'hover:bg-gray-50' : ''}`}
                          >
                            {classInfo ? (
                             <div className="relative">
                             <div className="font-medium text-blue-600">
                               {classInfo.name}
                             </div>
                             <div className="text-sm text-gray-600">
                               {classInfo.room}教室
                             </div>
                             {classInfo.description && (
                               <div className="text-xs text-gray-500 mt-0.5">
                                 {classInfo.description}
                               </div>
                             )}
                              <div className="flex flex-col gap-1 mt-1 justify-center">
  {classInfo.credits && (
    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-center whitespace-nowrap">
      {classInfo.credits}學分
    </span>
  )}
  {classInfo.course_type && (
    <span className={`px-2 py-0.5 rounded-full text-center whitespace-nowrap ${
      classInfo.course_type === 1 ? 
        'bg-red-100 text-red-800' : 
        'bg-green-100 text-green-800'
    }`}>
      {getCourseTypeName(classInfo.course_type)}
    </span>
  )}
</div>
  <div className="absolute top-0 right-0 hidden group-hover:flex gap-1 p-1 bg-white rounded shadow-sm">
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(day, time, allSchedule)}>
      <Edit className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(day, time, allSchedule)}>
      <Trash className="h-4 w-4 text-red-500" />
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
      )}

      <Dialog open={isAddingOpen} onOpenChange={setIsAddingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{isEditing ? '編輯課程' : '添加新課程'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* 課程名稱選擇 - 使用 datalist 實現自動完成 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right font-medium">課程名稱</Label>
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