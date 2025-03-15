'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Filter } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function TranscriptPage() {
  // 使用ref来保存select元素的引用
  const termSelectRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // 默认值设置为113学年第1学期的学期成绩
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 筛选状态 - 默认固定筛选113学年，1学期，学期成绩(1)
  const [filterAcademicYear, setFilterAcademicYear] = useState("113");
  const [filterTerm, setFilterTerm] = useState("1");  // 预设为1(第一学期)
  const [filterScoreType, setFilterScoreType] = useState("1");  // 移除了全部选项，始终必须选择一个类型

  const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        return data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry('/api/grades');
      setGrades(data);
      console.log("获取到的成绩数据:", data.length, "条记录");
      
      // 检查是否有113学年第1学期的数据
      const has113Term1 = data.some(g => 
        String(g.academic_year) === "113" && 
        String(g.term) === "1"
      );
      console.log("是否有113学年1学期的数据:", has113Term1);
      
      if (has113Term1) {
        const sample = data.find(g => 
          String(g.academic_year) === "113" && 
          String(g.term) === "1"
        );
        console.log("113学年1学期示例数据:", sample);
      } else {
        console.log("未找到113学年1学期数据，可能需要调整默认筛选");
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('無法載入成績資料');
      setError('無法載入成績資料');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchGrades();
    console.log("初始筛选设置:", {
      学年: filterAcademicYear,
      学期: filterTerm,
      类型: filterScoreType
    });
  }, []);
  
  // 确保学期下拉菜单在组件挂载后选择"1"
  useEffect(() => {
    // 在组件挂载后强制设置学期选择器的值
    if (termSelectRef.current) {
      termSelectRef.current.value = "1";
      console.log("已手动将学期选择框设置为: 1");
    }
  }, []);

  // 将数字成绩类型转换为可读的文本
  const getScoreTypeText = (type) => {
    // 确保type被处理为字符串比较
    const typeStr = String(type);
    switch (typeStr) {
      case "1": return "學期成績";
      case "2": return "期中考試";
      case "3": return "期末考試";
      case "4": return "平時成績";
      default: return `其他(${type})`;
    }
  };
  
  // 获取学期文本描述
  const getTermText = (term) => {
    // 显示学期描述 (1 -> 第一学期, 2 -> 第二学期等)
    const termStr = String(term);
    switch (termStr) {
      case "1": return "第一學期";
      case "2": return "第二學期";
      case "3": return "第三學期";
      case "4": return "第四學期";
      default: return `第${term}學期`;
    }
  };

  // 筛选逻辑
  const filteredGrades = grades.filter(grade => {
    // 筛选学年
    const yearMatches = !filterAcademicYear || String(grade.academic_year) === filterAcademicYear;
    
    // 筛选学期
    const termMatches = !filterTerm || String(grade.term) === filterTerm;
    
    // 筛选成绩类型 - 总是必须匹配选择的类型
    const scoreTypeMatches = String(grade.score_type) === filterScoreType;
    
    return yearMatches && termMatches && scoreTypeMatches;
  });

  // 获取唯一的学年、学期和成绩类型
  const academicYears = [...new Set(grades.map(grade => grade.academic_year))]
    .filter(Boolean)
    .sort((a, b) => {
      // 确保按数字降序排列，新学年在前
      return parseInt(b) - parseInt(a);
    });
  
  const terms = [...new Set(grades.map(grade => grade.term))]
    .filter(Boolean)
    .sort((a, b) => parseInt(a) - parseInt(b));  // 按数字升序排列
  
  const scoreTypes = [...new Set(grades.map(grade => grade.score_type))]
    .filter(Boolean)
    .sort((a, b) => parseInt(a) - parseInt(b));

  // 按学年学期分组
  const groupedGrades = filteredGrades.reduce((acc, grade) => {
    const academic_year = grade.academic_year || '未知';
    const term = grade.term || '未知';
    const key = `${academic_year}-${term}`;
    
    if (!acc[key]) {
      acc[key] = {
        academicYear: academic_year,
        term: term,
        grades: []
      };
    }
    
    acc[key].grades.push(grade);
    return acc;
  }, {});
  
  // 对每个分组内的课程按id排序
  Object.values(groupedGrades).forEach(group => {
    group.grades.sort((a, b) => a.id - b.id);
  });

  const calculateSemesterStats = (semesterGrades) => {
    if (!semesterGrades.length) return { average: 0, highest: 0, lowest: 0, totalScore: 0, totalCredits: 0 };

    // 如果有average_score，使用它
    if (semesterGrades[0].average_score != null) {
      const highestGrade = semesterGrades.reduce((max, grade) => 
        (parseFloat(grade.score) > parseFloat(max.score)) ? grade : max, semesterGrades[0]);
        
      const lowestGrade = semesterGrades.reduce((min, grade) => 
        (parseFloat(grade.score) < parseFloat(min.score)) ? grade : min, semesterGrades[0]);

      return {
        average: typeof semesterGrades[0].average_score === 'number' 
          ? semesterGrades[0].average_score.toFixed(1) 
          : parseFloat(semesterGrades[0].average_score).toFixed(1),
        highest: parseFloat(highestGrade.score),
        lowest: parseFloat(lowestGrade.score),
        totalScore: semesterGrades.reduce((sum, grade) => sum + parseFloat(grade.score || 0), 0),
        totalCredits: semesterGrades[0].total_credits || 
          semesterGrades.reduce((sum, grade) => sum + parseFloat(grade.credits || 0), 0)
      };
    } else {
      // 否则手动计算
      const weightedScores = semesterGrades.map(grade => 
        parseFloat(grade.score || 0) * parseFloat(grade.credits || 0));
      const totalCredits = semesterGrades.reduce((sum, grade) => 
        sum + parseFloat(grade.credits || 0), 0);
      const totalWeightedScore = weightedScores.reduce((a, b) => a + b, 0);
      
      return {
        average: totalCredits > 0 ? (totalWeightedScore / totalCredits).toFixed(1) : "0.0",
        highest: Math.max(...semesterGrades.map(grade => parseFloat(grade.score || 0))),
        lowest: Math.min(...semesterGrades.map(grade => parseFloat(grade.score || 0))),
        totalScore: semesterGrades.reduce((sum, grade) => sum + parseFloat(grade.score || 0), 0),
        totalCredits
      };
    }
  };

  // 只在DOM首次渲染后执行一次，用于确保select元素显示正确的预设值
  useEffect(() => {
    if (initialLoad && !loading && termSelectRef.current) {
      // 手动设置学期选择器的值为1
      termSelectRef.current.value = "1";
      console.log("在DOM首次渲染后设置学期选择器为: 1");
      setInitialLoad(false);
    }
  }, [loading, initialLoad]);

  return (
    <div className="mx-auto mt-8 px-1 space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>成績查詢</CardTitle>
          <button 
            onClick={fetchGrades} 
            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                加載中
              </span>
            ) : '重新加載'}
          </button>
        </CardHeader>
        <CardContent>
          {/* 修改为在所有屏幕尺寸下都并排显示筛选器，包括移动设备 */}
          <div className="mb-6 flex flex-row space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                學年度
              </label>
              <select
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
                className="block w-full h-9 rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:leading-6"
              >
                <option value="">全部</option>
                {academicYears.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                學期
              </label>
              <select
                ref={termSelectRef}
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="block w-full h-9 rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:leading-6"
                defaultValue="1"
              >
                <option value="">全部</option>
                {terms.map((term) => (
                  <option key={term} value={String(term)}>
                    {term}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                成績類型
              </label>
              <select
                value={filterScoreType}
                onChange={(e) => setFilterScoreType(e.target.value)}
                className="block w-full h-9 rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:leading-6"
              >
                {/* 已移除 "全部" 选项，成绩类型必须选择一个具体类型 */}
                <option value="1">學期</option>
                <option value="2">期中</option>
                <option value="3">期末</option>
                <option value="4">平時</option>
                {scoreTypes
                  .filter(type => !["1", "2", "3", "4"].includes(String(type)))
                  .map((type) => (
                    <option key={type} value={String(type)}>
                      {getScoreTypeText(type)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4 text-gray-500">
              <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
              加載中...
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              {error}
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>目前沒有符合筛选条件的成績記錄</p>
              <p className="mt-2 text-xs">當前篩選: {filterAcademicYear ? `${filterAcademicYear}學年` : '全部學年'} {filterTerm || '全部學期'} {getScoreTypeText(filterScoreType)}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedGrades).map(([key, { academicYear, term, grades: termGrades }]) => {
                const stats = calculateSemesterStats(termGrades);
                
                return (
                  <div key={key} className="rounded-lg border p-4">
                    <h3 className="text-xl font-semibold mb-2">{academicYear}學年 {getTermText(term)}</h3>
                    
                    <div className="flex flex-wrap justify-between mb-4 text-sm text-gray-600">
                      <div>平均分數：<span className={parseFloat(stats.average) < 60 ? 'text-red-600 font-bold' : ''}>{stats.average}</span></div>
                      <div>總學分：{stats.totalCredits}</div>
                      {termGrades[0].class_rank && <div>班級排名：{termGrades[0].class_rank}</div>}
                      {termGrades[0].pass_credits && <div>通過學分：{termGrades[0].pass_credits}/{termGrades[0].total_credits}</div>}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              課程名稱
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              成績
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              課程類別
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              學分
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {termGrades.map((grade) => (
                            <tr key={grade.id}>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {grade.course_name}
                              </td>
                              <td className={`px-4 py-4 whitespace-nowrap font-medium ${parseFloat(grade.score) < 60 ? 'text-red-600' : ''}`}>
                                <div className="flex items-center">
                                  {grade.score}
                                  {parseFloat(grade.score) >= 80 && (
                                    <div className="ml-2 relative w-6 h-6">
                                      <img
                                        src="/good.png"
                                        alt="Good score"
                                        className="w-6 h-6 object-contain"
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                {grade.course_category}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                {grade.credits}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}