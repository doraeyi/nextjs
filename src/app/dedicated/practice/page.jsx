"use client";
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Practice() {
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/subjects');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        console.error(err);
        setError('無法取得科目列表');
      }
    };
    fetchSubjects();
  }, []);

  const fetchQuestions = async (subjectId) => {
    try {
      const res = await fetch(`/api/questions?subjectId=${subjectId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      const formattedQuestions = data.map((question) => {
        const questionType = question.question_type;
        
        let parsedOptions = [];
        if (questionType === 'multiple_choice') {
          if (typeof question.options === 'string') {
            try {
              parsedOptions = JSON.parse(question.options);
            } catch (e) {
              console.error('解析選項失敗:', e);
              parsedOptions = [];
            }
          } else if (Array.isArray(question.options)) {
            parsedOptions = question.options;
          }
        }

        return {
          ...question,
          id: question.id,
          questionText: question.question_text,
          questionType: questionType,
          correctAnswer: question.correct_answer,
          options: parsedOptions,
        };
      });

      console.log('格式化後的問題:', formattedQuestions);
      setQuestions(formattedQuestions);
      setAnswers({});
      setShowResults(false);
    } catch (err) {
      console.error('獲取問題時出錯:', err);
      setError('無法取得題目');
    }
  };

  const handleSubjectChange = (e) => {
    const selectedSubjectId = e.target.value;
    setSubjectId(selectedSubjectId);
    if (selectedSubjectId) {
      fetchQuestions(selectedSubjectId);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      setError('請回答所有問題再提交');
      return;
    }

    // Calculate results
    const questionResults = questions.map(question => ({
      id: question.id,
      questionText: question.questionText,
      userAnswer: answers[question.id],
      correctAnswer: question.correctAnswer,
      isCorrect: answers[question.id] === question.correctAnswer
    }));

    const totalQuestions = questions.length;
    const correctAnswers = questionResults.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    setResults({
      score,
      totalQuestions,
      correctAnswers,
      questionResults
    });
    setShowResults(true);
    setError(null);
  };

  return (
    <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold text-center mb-6">選擇科目進行練習</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <select
        value={subjectId}
        onChange={handleSubjectChange}
        required
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
      >
        <option value="" disabled>選擇科目</option>
        {subjects.map(subject => (
          <option key={subject.id} value={subject.id}>{subject.name}</option>
        ))}
      </select>

      <div className="mt-6">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">
                {index + 1}. {question.questionText}
                <span className="text-gray-500 text-sm ml-2">
                  ({question.questionType === 'true_false' ? '是非題' : '選擇題'})
                </span>
              </h4>

              {question.questionType === 'true_false' && (
                <div className="space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="O"
                      checked={answers[question.id] === 'O'}
                      onChange={() => handleAnswerChange(question.id, 'O')}
                      className="mr-2"
                      disabled={showResults}
                    />
                    <span>O</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="X"
                      checked={answers[question.id] === 'X'}
                      onChange={() => handleAnswerChange(question.id, 'X')}
                      className="mr-2"
                      disabled={showResults}
                    />
                    <span>X</span>
                  </label>
                </div>
              )}

              {question.questionType === 'multiple_choice' && question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  {question.options.map((option, i) => (
                    <label key={i} className="block">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        className="mr-2"
                        disabled={showResults}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {showResults && (
                <div className="mt-3">
                  <div className={`p-2 rounded ${
                    answers[question.id] === question.correctAnswer 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {answers[question.id] === question.correctAnswer 
                      ? '答對了！' 
                      : `答錯了。正確答案是：${question.correctAnswer}`}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">請選擇一個科目來顯示題目。</p>
        )}
      </div>

      {questions.length > 0 && !showResults && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            提交答案
          </button>
        </div>
      )}

      {showResults && results && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-bold text-center mb-4">測驗結果</h3>
          <div className="text-center">
            <p className="text-lg">得分：{results.score}%</p>
            <p>答對 {results.correctAnswers} 題，共 {results.totalQuestions} 題</p>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowResults(false);
                setAnswers({});
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
            >
              重新作答
            </button>
          </div>
        </div>
      )}
    </div>
  );
}