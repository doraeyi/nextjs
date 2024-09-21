"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [questionText, setQuestionText] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);

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
        setError('Failed to fetch subjects');
      }
    };
    fetchSubjects();
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subjectId,
        questionText,
        questionType,
        options: questionType === 'multiple_choice' ? options : null,
        correctAnswer,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error(errorData);
      setError(errorData.message || 'Failed to submit the question');
      return;
    }

    alert('題目新增成功！');
    setQuestionText('');
    setSubjectId('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
  };

  return (
    <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold text-center mb-6">自我練習系統</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
        >
          <option value="" disabled>選擇科目</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>

        <input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="題目"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
        />

        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
        >
          <option value="multiple_choice">選擇題</option>
          <option value="true_false">是非題</option>
        </select>

        {questionType === 'multiple_choice' && (
          <>
            <h4 className="font-semibold">選項</h4>
            {options.map((option, index) => (
              <input
                key={index}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`選項 ${index + 1}`}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              />
            ))}
          </>
        )}

        {questionType === 'true_false' && (
          <>
            <h4 className="font-semibold">正確答案</h4>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            >
              <option value="" disabled>選擇正確答案</option>
              <option value="O">O</option>
              <option value="X">X</option>
            </select>
          </>
        )}

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          提交
        </button>
      </form>
    </div>
  );
}
