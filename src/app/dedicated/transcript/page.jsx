'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search } from 'lucide-react';
import ErrorMessage from '@/components/ui/ErrorMessage'; // 確保這裡是正確的路徑
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // 確保這裡是正確的路徑

export default function GradeForm() {
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [score, setScore] = useState('');
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState('');
  const [showGrades, setShowGrades] = useState(false);
  const [filterSemester, setFilterSemester] = useState('');
  const [loadingStates, setLoadingStates] = useState({
    subjects: true,
    semesters: true,
    grades: true,
    submission: false
  });
  const [errors, setErrors] = useState({
    subjects: null,
    semesters: null,
    grades: null,
    submission: null
  });

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

  const fetchData = async (type, url) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));

    try {
      const data = await fetchWithRetry(url);
      switch (type) {
        case 'subjects':
          setSubjects(data);
          break;
        case 'semesters':
          const sortedSemesters = [...data].sort((a, b) => a.id - b.id);
          setSemesters(sortedSemesters);
          break;
        case 'grades':
          setGrades(data);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setErrors(prev => ({
        ...prev,
        [type]: `無法載入${type === 'subjects' ? '科目' : type === 'semesters' ? '學期' : '成績'}資料`
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    fetchData('subjects', '/api/subjects');
    fetchData('semesters', '/api/semesters');
    fetchData('grades', '/api/grades');
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, submission: true }));
    setErrors(prev => ({ ...prev, submission: null }));
    setMessage('');

    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          semesterId: selectedSemester,
          score: Number(score)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '儲存失敗');
      }

      setMessage('成績已成功儲存');
      resetForm();
      await fetchData('grades', '/api/grades');
    } catch (error) {
      console.error('Error saving grade:', error);
      setErrors(prev => ({
        ...prev,
        submission: error.message || '儲存時發生錯誤'
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, submission: false }));
    }
  };

  const resetForm = () => {
    setScore('');
    setSelectedSubject('');
    setSelectedSemester('');
  };

  const filteredGrades = grades.filter(grade => {
    if (!filterSemester) return true;
    return grade.semesterId.toString() === filterSemester.toString();
  });

  const groupedGrades = filteredGrades.reduce((acc, grade) => {
    const semesterId = grade.semesterId.toString();
    if (!acc[semesterId]) {
      acc[semesterId] = {
        name: grade.semester_name,
        grades: []
      };
    }
    acc[semesterId].grades.push(grade);
    return acc;
  }, {});

  const calculateSemesterStats = (semesterGrades) => {
    if (!semesterGrades.length) return { average: 0, highest: 0, lowest: 0, total: 0 };
  
    const scores = semesterGrades.map(grade => grade.score);
    const total = scores.reduce((a, b) => a + b, 0);
    
    return {
      average: (total / scores.length).toFixed(1),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      total: total
    };
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新增成績</CardTitle>
        </CardHeader>
        <CardContent>
          {(message || errors.submission) && (
            <Alert 
              variant={message ? 'default' : 'destructive'}
              className="mb-4"
            >
              <AlertDescription>
                {message || errors.submission}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                選擇學期：
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                > 
                  <option value="">請選擇學期</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </label>
              {errors.semesters && (
                <p className="mt-1 text-sm text-red-600">{errors.semesters}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                選擇科目：
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loadingStates.subjects || loadingStates.submission}
                >
                  <option value="">請選擇科目</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
              {errors.subjects && (
                <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                成績：
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loadingStates.submission}
                />
              </label>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingStates.submission || loadingStates.subjects || loadingStates.semesters}
              >
                {loadingStates.submission ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    處理中...
                  </span>
                ) : '儲存成績'}
              </button>
              <button
                type="button"
                onClick={() => setShowGrades(!showGrades)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <span className="flex items-center justify-center">
                  <Search className="mr-2 h-5 w-5" />
                  {showGrades ? '隱藏成績' : '查詢成績'}
                </span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showGrades && (
        <Card>
          <CardHeader>
            <CardTitle>成績記錄</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">
                篩選學期：
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">全部學期</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {errors.grades && <ErrorMessage message={errors.grades} />}
            
            {loadingStates.grades ? (
              <LoadingSpinner />
            ) : filteredGrades.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                目前沒有成績記錄
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedGrades).map(([semesterId, { name: semesterName, grades: semesterGrades }]) => {
                  const stats = calculateSemesterStats(semesterGrades);
                  
                  return (
                    <div key={semesterId} className="rounded-lg border p-4">
                      <h3 className="text-xl font-semibold mb-2">{semesterName}</h3>
                      
                      <div className="flex justify-between mb-4 text-sm text-gray-600">
                        <div>總分：{stats.total}</div>
                        <div className={`text-gray-600 ${stats.average < 60 ? 'text-red-600' : ''}`}>
                          平均：{stats.average}
                        </div>
                        <div className={`text-gray-600 ${stats.highest < 60 ? 'text-red-600' : ''}`}>
                          最高：{stats.highest}
                        </div>
                        <div className={`text-gray-600 ${stats.lowest < 60 ? 'text-red-600' : ''}`}>
                          最低：{stats.lowest}
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                科目
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                成績
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {semesterGrades.map((grade) => (
                              <tr key={grade.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {grade.subject_name}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${grade.score < 60 ? 'text-red-600' : ''}`}>
                                  {grade.score}
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
      )}
    </div>
  );
}
