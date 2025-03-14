'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Filter } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function TranscriptPage() {
  // State for displaying and filtering
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterScoreType, setFilterScoreType] = useState('');

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
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('無法載入成績資料');
      setError('無法載入成績資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    
    // 添加调试代码，帮助排查问题
    const debugDataTypes = () => {
      if (grades.length > 0) {
        console.log("数据类型检查:");
        console.log("第一条记录 academic_year:", grades[0].academic_year, "类型:", typeof grades[0].academic_year);
        console.log("第一条记录 term:", grades[0].term, "类型:", typeof grades[0].term);
        console.log("筛选值 academic_year:", filterAcademicYear, "类型:", typeof filterAcademicYear);
        console.log("筛选值 term:", filterTerm, "类型:", typeof filterTerm);
        
        // 检查是否有113学年的数据
        const has113 = grades.some(g => String(g.academic_year) === "113");
        console.log("是否包含113学年数据:", has113);
        if (has113) {
          console.log("113学年数据样例:", grades.find(g => String(g.academic_year) === "113"));
        }
      }
    };
    
    if (grades.length > 0) {
      debugDataTypes();
    }
  }, [grades.length]);

  // 将数字成绩类型转换为可读的文本
  const getScoreTypeText = (type) => {
    switch (type) {
      case "1": return "学期成绩";
      case "2": return "期中考试";
      case "3": return "期末考试";
      case "4": return "平时成绩";
      default: return type; // 如果是其他值，直接返回原值
    }
  };

  const filteredGrades = grades.filter(grade => {
    if (!filterAcademicYear && !filterTerm && !filterScoreType) return true;
    
    // 使用字符串比较确保类型一致性
    const matchesYear = !filterAcademicYear || String(grade.academic_year) === String(filterAcademicYear);
    const matchesTerm = !filterTerm || String(grade.term) === String(filterTerm);
    const matchesScoreType = !filterScoreType || String(grade.score_type) === String(filterScoreType);
    
    return matchesYear && matchesTerm && matchesScoreType;
  });

  // Get unique academic years, terms and score types for filtering
  const academicYears = [...new Set(grades.map(grade => grade.academic_year))].filter(Boolean).sort();
  const terms = [...new Set(grades.map(grade => grade.term))].filter(Boolean).sort();
  const scoreTypes = [...new Set(grades.map(grade => grade.score_type))].filter(Boolean).sort();

  // Group grades by academic year and term
  const groupedGrades = filteredGrades.reduce((acc, grade) => {
    // Make sure academic_year and term are defined
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

  const calculateSemesterStats = (semesterGrades) => {
    if (!semesterGrades.length) return { average: 0, highest: 0, lowest: 0, totalScore: 0, totalCredits: 0 };

    // Use average_score if available, otherwise calculate from individual scores
    if (semesterGrades[0].average_score != null) {
      const highestGrade = semesterGrades.reduce((max, grade) => 
        (grade.score > max.score) ? grade : max, semesterGrades[0]);
        
      const lowestGrade = semesterGrades.reduce((min, grade) => 
        (grade.score < min.score) ? grade : min, semesterGrades[0]);

      return {
        average: typeof semesterGrades[0].average_score === 'number' 
          ? semesterGrades[0].average_score.toFixed(1) 
          : semesterGrades[0].average_score,
        highest: highestGrade.score,
        lowest: lowestGrade.score,
        totalScore: semesterGrades.reduce((sum, grade) => sum + grade.score, 0),
        totalCredits: semesterGrades[0].total_credits || semesterGrades.reduce((sum, grade) => sum + (grade.credits || 0), 0)
      };
    } else {
      // Calculate manually if average_score is not provided
      const weightedScores = semesterGrades.map(grade => grade.score * (grade.credits || 0));
      const totalCredits = semesterGrades.reduce((sum, grade) => sum + (grade.credits || 0), 0);
      const totalWeightedScore = weightedScores.reduce((a, b) => a + b, 0);
      
      return {
        average: totalCredits > 0 ? (totalWeightedScore / totalCredits).toFixed(1) : "0.0",
        highest: Math.max(...semesterGrades.map(grade => grade.score || 0)),
        lowest: Math.min(...semesterGrades.map(grade => grade.score || 0)),
        totalScore: semesterGrades.reduce((sum, grade) => sum + (grade.score || 0), 0),
        totalCredits
      };
    }
  };

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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                篩選學年度：
                <select
                  value={filterAcademicYear}
                  onChange={(e) => setFilterAcademicYear(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">全部學年度</option>
                  {academicYears.map((year) => (
                    <option key={year} value={year}>
                      {year}學年
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                篩選學期：
                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">全部學期</option>
                  {terms.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                成績類型：
                <select
                  value={filterScoreType}
                  onChange={(e) => setFilterScoreType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">全部類型</option>
                  <option value="1">學期成績</option>
                  <option value="2">期中考試</option>
                  <option value="3">期末考試</option>
                  <option value="4">平時成績</option>
                  {/* 显示数据库中可能存在的其他成绩类型 */}
                  {scoreTypes
                    .filter(type => !["1", "2", "3", "4"].includes(type))
                    .map((type) => (
                      <option key={type} value={type}>
                        {getScoreTypeText(type)}
                      </option>
                    ))}
                </select>
              </label>
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
              目前沒有成績記錄
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedGrades).map(([key, { academicYear, term, grades: termGrades }]) => {
                const stats = calculateSemesterStats(termGrades);
                
                return (
                  <div key={key} className="rounded-lg border p-4">
                    <h3 className="text-xl font-semibold mb-2">{academicYear}學年 {term}</h3>
                    
                    <div className="flex flex-wrap justify-between mb-4 text-sm text-gray-600">
                      <div>平均分數：<span className={stats.average < 60 ? 'text-red-600 font-bold' : ''}>{stats.average}</span></div>
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
                              <td className={`px-4 py-4 whitespace-nowrap font-medium ${grade.score < 60 ? 'text-red-600' : ''}`}>
                                <div className="flex items-center">
                                  {grade.score}
                                  {grade.score >= 80 && (
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