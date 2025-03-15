'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { 
  Home, Info, Settings, Loader, UserCircle, 
  XIcon, BookOpen, Camera, Music, ChevronRight, Plus,
  ImageIcon, Pencil, GraduationCap, Award, FileText, BarChart,
  AlertTriangle, X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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

// FailedCoursesDialog Component - 显示未通过课程的弹出窗口
const FailedCoursesDialog = ({ isOpen, onClose, failedCourses, term, academicYear }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] z-10">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            未通過科目 - {academicYear}學年 {term}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {failedCourses.length === 0 ? (
            <p className="text-center text-gray-500 py-4">沒有未通過的科目</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                以下科目成績未達60分，需要補修或重修：
              </p>
              {failedCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{course.course_name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{course.course_category} · {course.credits} 學分</p>
                    </div>
                    <div className="text-red-600 font-bold text-xl">{course.score}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onClose}
          >
            關閉
          </Button>
        </div>
      </div>
    </div>
  );
};

// GraduationRequirementsContent Component
const GraduationRequirementsContent = ({ onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [semesterData, setSemesterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFailedCourses, setShowFailedCourses] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const fetchGraduationData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/grades');
        if (!response.ok) throw new Error('無法獲取成績數據');
        const data = await response.json();
        
        // 只保留score_type=1（学期成绩）的记录
        const semesterGrades = data.filter(grade => String(grade.score_type) === "1");
        
        // 直接按学期分组
        const groupedByTerm = {};
        semesterGrades.forEach(grade => {
          const key = `${grade.academic_year}-${grade.term}`;
          if (!groupedByTerm[key]) {
            groupedByTerm[key] = [];
          }
          groupedByTerm[key].push(grade);
        });
        
        // 转换为数组，每个学期有自己的成绩数组
        const semestersArray = Object.entries(groupedByTerm).map(([key, grades]) => {
          const termInfo = grades[0];
          
          // 查找未通过的课程
          const failedCourses = grades.filter(grade => parseFloat(grade.score) < 60);
          
          return {
            academicYear: termInfo.academic_year,
            term: termInfo.term,
            termGrades: grades,
            failedCourses: failedCourses,
            stats: {
              average: termInfo.average_score, // 直接使用average_score
              totalCredits: termInfo.total_credits,
            }
          };
        }).sort((a, b) => {
          // 按学年学期排序，降序
          if (a.academicYear !== b.academicYear) return b.academicYear - a.academicYear;
          return b.term - a.term;
        });
        
        console.log("学期成绩数据:", semestersArray);
        setSemesterData(semestersArray);
      } catch (err) {
        setError(err.message);
        console.error("获取成绩数据错误:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraduationData();
  }, []);

  // 處理通過學分點擊
  const handlePassCreditsClick = (semester) => {
    setSelectedSemester(semester);
    setShowFailedCourses(true);
  };
  
  // 处理详细成绩查看
  const handleViewTranscript = (academicYear, term) => {
    // 关闭滑出菜单
    if (onClose) onClose();
    
    // 检查当前是否已在成绩单页面
    if (pathname === '/transcript') {
      // 如果已在成绩单页面，只更新查询参数
      router.push(`/transcript?year=${academicYear}&term=${term}`, { scroll: false });
    } else {
      // 否则导航到成绩单页面
      router.push(`/transcript?year=${academicYear}&term=${term}`);
    }
  };

  // 計算總體進度 - 使用每个学期的数据累加
  const overallProgress = semesterData.length > 0 
    ? {
        totalRequiredCredits: 128, // 假設畢業要求128學分
        totalEarnedCredits: semesterData.reduce((sum, sem) => {
          // 使用学期中第一条记录的pass_credits，如果存在的话
          if (sem.termGrades && sem.termGrades.length > 0 && sem.termGrades[0].pass_credits) {
            return sum + Number(sem.termGrades[0].pass_credits);
          }
          return sum;
        }, 0),
        generalEducationCredits: 30, // 假設通識教育要求
        earnedGeneralEducationCredits: 18, // 假設已修的通識學分
        majorCredits: 75, // 假設主修要求
        earnedMajorCredits: 60, // 假設已修的主修學分
        electiveCredits: 23, // 假設選修要求
        earnedElectiveCredits: 15, // 假設已修的選修學分
      }
    : null;

  // 获取学期描述
  const getTermText = (term) => {
    const termStr = String(term);
    switch (termStr) {
      case "1": return "第一學期";
      case "2": return "第二學期";
      default: return `第${term}學期`;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">
          {error}
        </div>
      ) : semesterData.length === 0 ? (
        <div className="text-center text-gray-500 p-4">
          沒有找到任何學期成績記錄
        </div>
      ) : (
        <>
          {/* 畢業總進度 */}
          {overallProgress && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                畢業總進度
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>總學分進度</span>
                    <span>{overallProgress.totalEarnedCredits}/{overallProgress.totalRequiredCredits} 學分</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (overallProgress.totalEarnedCredits / overallProgress.totalRequiredCredits) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>通識教育</span>
                    <span>{overallProgress.earnedGeneralEducationCredits}/{overallProgress.generalEducationCredits} 學分</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (overallProgress.earnedGeneralEducationCredits / overallProgress.generalEducationCredits) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>主修科目</span>
                    <span>{overallProgress.earnedMajorCredits}/{overallProgress.majorCredits} 學分</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-purple-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (overallProgress.earnedMajorCredits / overallProgress.majorCredits) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>選修科目</span>
                    <span>{overallProgress.earnedElectiveCredits}/{overallProgress.electiveCredits} 學分</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (overallProgress.earnedElectiveCredits / overallProgress.electiveCredits) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.location.href = '/graduation/requirements'}
                >
                  查看畢業要求詳情
                </Button>
              </div>
            </div>
          )}
          
          {/* 學期成績列表 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-blue-500" />
              學期成績概覽
            </h3>
            
            {semesterData.map((semester, index) => {
              const { academicYear, term, termGrades, stats, failedCourses } = semester;
              const hasFailedCourses = failedCourses && failedCourses.length > 0;
              
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h4 className="font-medium text-base mb-2">
                    {academicYear}學年 {getTermText(term)}
                  </h4>
                  
                  <div className="flex flex-wrap justify-between mb-4 text-sm text-gray-600">
                    <div>平均分數：<span className={parseFloat(stats.average) < 60 ? 'text-red-600 font-bold' : ''}>{stats.average}</span></div>
                    {termGrades[0].pass_credits && (
                      <button 
                        onClick={() => handlePassCreditsClick(semester)}
                        className={`${hasFailedCourses ? 'text-red-500 hover:text-red-700' : 'text-gray-600'} cursor-pointer flex items-center`}
                      >
                        通過學分：
                        <span className="font-medium mx-1">{termGrades[0].pass_credits}/{termGrades[0].total_credits}</span>
                        {hasFailedCourses && (
                          <AlertTriangle className="h-4 w-4 ml-1" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-3">
                    <div 
                      className={`h-2.5 rounded-full ${Number(stats.average) >= 80 ? 'bg-green-500' : Number(stats.average) >= 70 ? 'bg-blue-500' : Number(stats.average) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (Number(stats.average) / 100) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <button 
                    onClick={() => handleViewTranscript(academicYear, term)}
                    className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    查看詳細成績
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* 未通过课程弹窗 */}
          {selectedSemester && (
            <FailedCoursesDialog 
              isOpen={showFailedCourses}
              onClose={() => setShowFailedCourses(false)}
              failedCourses={selectedSemester.failedCourses}
              term={getTermText(selectedSemester.term)}
              academicYear={selectedSemester.academicYear}
            />
          )}
        </>
      )}
    </div>
  );
};

// SlideOutMenu Component
const SlideOutMenu = ({ isOpen, onClose, activeMenu }) => {
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
              畢業門檻與成績
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="h-[calc(100vh-57px)] overflow-y-auto overscroll-contain">
            <GraduationRequirementsContent onClose={onClose} />
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
                畢業門檻與成績
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
            <GraduationRequirementsContent onClose={onClose} />
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
      <GraduationCap className="w-6 h-6 text-white" />
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

  // Handle graduation requirements menu
  const handleGraduationMenu = () => {
    if (activeMenu === 'graduation' && isMenuOpen) {
      setIsMenuOpen(false);
      setActiveMenu(null);
      setImageToggle(false);
    } else {
      setIsMenuOpen(true);
      setActiveMenu('graduation');
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
                text="畢業門檻" 
                onClick={handleGraduationMenu}
                isActive={activeMenu === 'graduation' && isMenuOpen}
              />
            </div>
          </div>
          <FloatingButton 
            imageToggle={imageToggle}
            onClick={handleGraduationMenu}
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