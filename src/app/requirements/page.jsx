'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  GraduationCap, 
  Loader,
  XCircle,
  Filter,
  Calendar,
  Info,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";

// 課程類別對照表
const COURSE_CATEGORY_MAP = {
  1: { name: "一般科目必修", color: "bg-green-100 text-green-800" },
  2: { name: "校訂科目必修", color: "bg-yellow-100 text-yellow-800" },
  3: { name: "專業科目必修", color: "bg-purple-100 text-purple-800" },
  4: { name: "專業科目選修", color: "bg-red-100 text-red-800" },
  5: { name: "一般科目選修", color: "bg-orange-100 text-orange-800" },
  // 添加自填類型
  6: { name: "自填", color: "bg-blue-100 text-blue-800" }
};

// 自填課程彈窗組件
const SelfFilledCoursesDialog = ({ isOpen, onClose, courses, semester, category }) => {
  if (!isOpen) return null;
  
  const categoryObj = category ? (COURSE_CATEGORY_MAP[category] || {
    name: "未知類別",
    color: "bg-gray-100 text-gray-800"
  }) : null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] z-10">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            自填課程詳情
            {semester && <span className="ml-2 text-sm text-gray-500">({semester})</span>}
            {category && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${categoryObj.color}`}>
                {categoryObj.name}
              </span>
            )}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-0 max-h-[60vh]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300 sticky top-0">
              <tr>
                <th scope="col" className="px-3 py-2 w-20">學期</th>
                <th scope="col" className="px-3 py-2">課程名稱</th>
                <th scope="col" className="px-3 py-2 w-16 text-center">學分</th>
                <th scope="col" className="px-3 py-2 w-28">課程類別</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-3 py-3 text-center text-gray-500">
                    無符合條件的課程記錄
                  </td>
                </tr>
              ) : (
                courses.map((course, index) => {
                  const courseCategoryObj = COURSE_CATEGORY_MAP[course.course_type || 6] || {
                    name: "未知類別",
                    color: "bg-gray-100 text-gray-800"
                  };
                  
                  return (
                    <tr 
                      key={course.id || index} 
                      className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{course.semester || '-'}</td>
                      <td className="px-3 py-2 text-sm">{course.title}</td>
                      <td className="px-3 py-2 text-center text-sm">{course.credits}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${courseCategoryObj.color}`}>
                          {courseCategoryObj.name}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            共 <span className="font-semibold">{courses.length}</span> 門已選課程
          </div>
          <Button variant="outline" onClick={onClose}>關閉</Button>
        </div>
      </div>
    </div>
  );
};

// 畢業要求頁面 - 表格形式
const RequirementsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' or category number
  const [semesterFilter, setSemesterFilter] = useState(''); // 不預設學期
  const [availableSemesters, setAvailableSemesters] = useState([]);
  
  // 自填課程相關狀態
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSelfFilledInfo, setSelectedSelfFilledInfo] = useState(null);
  const [filteredUserCourses, setFilteredUserCourses] = useState([]);
  const [loadingUserCourses, setLoadingUserCourses] = useState(false);
  
  // 獲取課程數據
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // 使用課程安排 API 路由
        const response = await fetch('/api/course_schedule');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 回應:', errorText);
          throw new Error('無法獲取課程數據');
        }
        
        const data = await response.json();
        const courseList = data.courses || [];
        
        // 按ID排序
        const sortedCourses = [...courseList].sort((a, b) => a.id - b.id);
        setCourses(sortedCourses);
        setFilteredCourses(sortedCourses);
        
        // 獲取並適當排序可用學期 (不會預設選擇)
        const semesters = [...new Set(courseList.map(course => course.semester))].sort();
        setAvailableSemesters(semesters);
      } catch (err) {
        console.error("獲取課程數據錯誤:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // 處理過濾器變更
  useEffect(() => {
    let filtered = [...courses];
    
    // 應用學期過濾
    if (semesterFilter) {
      filtered = filtered.filter(course => course.semester === semesterFilter);
    }
    
    // 應用類別過濾
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => 
        course.course_category.toString() === categoryFilter
      );
    }
    
    setFilteredCourses(filtered);
  }, [categoryFilter, semesterFilter, courses]);
  
  // 計算類別統計 (基於當前過濾的課程)
  const getCategoryStats = () => {
    const stats = {
      total: 0,
      categories: {}
    };
    
    // 初始化類別統計
    Object.keys(COURSE_CATEGORY_MAP).forEach(category => {
      stats.categories[category] = 0;
    });
    
    // 計算各類別總學分
    filteredCourses.forEach(course => {
      const category = course.course_category.toString();
      const credits = parseInt(course.credits) || 0;
      
      if (stats.categories[category] !== undefined) {
        stats.categories[category] += credits;
        stats.total += credits;
      }
    });
    
    return stats;
  };
  
  // 處理點擊自填課程
  const handleSelfFilledClick = async (course) => {
    setLoadingUserCourses(true);
    setSelectedSelfFilledInfo({
      semester: course.semester,
      category: course.course_category === 6 ? null : course.course_category
    });
    
    try {
      // 從 schedules API 獲取用戶選課數據
      const response = await fetch('/api/schedule-event');
      if (!response.ok) {
        throw new Error('無法獲取已選課程');
      }
      
      const data = await response.json();
      if (data.schedules) {
        const allUserCourses = data.schedules;
        
        // 過濾出指定學期和類別的課程
        const semesterToMatch = course.semester; // 例如 "113-2"
        const categoryToMatch = course.course_category === 6 
          ? null  // 如果自填課程本身沒有指定類別，則不過濾類別
          : course.course_category; // 例如 4 (專業科目選修)
          
        let filtered = allUserCourses;
        
        // 按學期過濾
        if (semesterToMatch) {
          filtered = filtered.filter(c => c.semester === semesterToMatch);
        }
        
        // 按類別過濾
        if (categoryToMatch) {
          filtered = filtered.filter(c => parseInt(c.course_type) === categoryToMatch);
        }
        
        setFilteredUserCourses(filtered);
        setDialogOpen(true);
      }
    } catch (err) {
      console.error("獲取用戶課表錯誤:", err);
      alert('無法獲取已選課程: ' + err.message);
    } finally {
      setLoadingUserCourses(false);
    }
  };
  
  // 關閉彈窗
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSelfFilledInfo(null);
    setFilteredUserCourses([]);
  };
  
  const stats = getCategoryStats();
  
  return (
    <div className="container mx-auto px-3 py-5 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center">
          <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" />
          畢業要求課程表
        </h2>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
        >
          返回
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2 text-gray-600">加載中...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-500">{error}</p>
          </div>
          <p className="mt-2 text-gray-600">請稍後再試或聯絡管理員。</p>
        </div>
      ) : (
        <>
          {/* 學分統計卡片 - 水平捲動版本 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              {semesterFilter ? `${semesterFilter} 學期課程統計` : '課程學分統計'}
            </h3>
            
            {/* 水平捲動容器 */}
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-3" style={{ minWidth: 'max-content' }}>
                {/* 總學分卡片 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex flex-col min-w-[90px]">
                  <span className="text-sm text-gray-500 dark:text-gray-400">總學分</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.total}</span>
                </div>
                
                {/* 各類別學分卡片 */}
                {Object.entries(COURSE_CATEGORY_MAP).map(([categoryId, category]) => {
                  // 只顯示有學分的類別
                  if (stats.categories[categoryId] <= 0) return null;
                  
                  return (
                    <div 
                      key={categoryId}
                      className={`rounded-lg p-3 flex flex-col min-w-[110px] ${category.color.split(' ')[0]} dark:bg-opacity-20`}
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400">{category.name}</span>
                      <span className={`text-xl font-bold mt-1 ${category.color.split(' ')[1]}`}>
                        {stats.categories[categoryId] || 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* 過濾和表格 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* 過濾控制 */}
            <div className="p-3 border-b dark:border-gray-700">
              {/* 學期過濾 */}
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm font-medium">學期：</span>
                </div>
                
                <div className="overflow-x-auto pb-1">
                  <div className="flex space-x-2" style={{ minWidth: 'max-content' }}>
                    <Button 
                      variant={!semesterFilter ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSemesterFilter('')}
                    >
                      全部學期
                    </Button>
                    
                    {availableSemesters.map(semester => (
                      <Button 
                        key={semester}
                        variant={semesterFilter === semester ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSemesterFilter(semester)}
                      >
                        {semester}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 類別過濾 */}
              <div>
                <div className="flex items-center mb-1">
                  <Filter className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm font-medium">課程類別：</span>
                </div>
                
                <div className="overflow-x-auto pb-1">
                  <div className="flex space-x-2" style={{ minWidth: 'max-content' }}>
                    <Button 
                      variant={categoryFilter === 'all' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCategoryFilter('all')}
                    >
                      全部類別
                    </Button>
                    
                    {Object.entries(COURSE_CATEGORY_MAP).map(([categoryId, category]) => (
                      <Button 
                        key={categoryId}
                        variant={categoryFilter === categoryId ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setCategoryFilter(categoryId)}
                        className={`${categoryFilter === categoryId ? '' : category.color}`}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 課程表格 - 確保在手機版可滑動，並且優化欄位寬度 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: '600px' }}>
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-3 py-2 w-20">學期</th>
                    <th scope="col" className="px-3 py-2  w-28">課程名稱</th>
                    <th scope="col" className="px-3 py-2 w-12 text-center">學分</th>
                    <th scope="col" className="px-3 py-2">課程類別</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-3 py-3 text-center text-gray-500">
                        無相關課程記錄
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course, index) => {
                      const categoryObj = COURSE_CATEGORY_MAP[course.course_category] || {
                        name: "未知類別",
                        color: "bg-gray-100 text-gray-800"
                      };
                      
                      // 檢查是否為自填類型的課程
                      const isSelfFilled = course.course_category === 6 || course.course_name === "自填";
                      
                      return (
                        <tr 
                          key={course.id || index} 
                          className={`
                            ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                            ${isSelfFilled ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
                          `}
                          onClick={isSelfFilled && !loadingUserCourses ? () => handleSelfFilledClick(course) : undefined}
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{course.semester}</td>
                          <td className="px-3 py-2 text-sm">
  <div className="flex items-center">
    {course.course_name}
    {isSelfFilled && (
      loadingUserCourses ? (
        <Loader className="h-3 w-3 ml-2 animate-spin text-blue-500" />
      ) : (
        <div className="relative ml-2 cursor-pointer group">
          <Info className="h-4 w-4 text-blue-500" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            點擊查看詳情
          </div>
        </div>
      )
    )}
  </div>

                          </td>
                          <td className="px-3 py-2 text-center text-sm">{course.credits}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${categoryObj.color}`}>
                              {categoryObj.name}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 表格頁腳 */}
            <div className="p-3 border-t dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                共 <span className="font-semibold">{filteredCourses.length}</span> 門課程 
                {semesterFilter && (
                  <span> (學期: {semesterFilter})</span>
                )}
              </div>
            </div>
          </div>
          
          {/* 自填課程彈窗 */}
          <SelfFilledCoursesDialog 
            isOpen={dialogOpen}
            onClose={handleCloseDialog}
            courses={filteredUserCourses}
            semester={selectedSelfFilledInfo?.semester}
            category={selectedSelfFilledInfo?.category}
          />
        </>
      )}
    </div>
  );
};

export default RequirementsPage;