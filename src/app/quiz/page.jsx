"use client";
import { useState, useEffect } from 'react';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch('/api/questions'); // 假設你有這個 API
      const data = await res.json();
      setQuestions(data);
    };
    
    fetchQuestions();
  }, []);

  const handleAnswer = (answer) => {
    setUserAnswers([...userAnswers, answer]);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (question.correct_answer === userAnswers[index]) {
        correct++;
      }
    });
    setScore(correct);
  };

  if (score !== null) {
    return <div>Your score: {score}/{questions.length}</div>;
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div>
        <button onClick={handleSubmit}>Submit Answers</button>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  return (
    <div>
      <h2>{question.question_text}</h2>
      {question.question_type === 'multiple_choice' && (
        question.options.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))
      )}
      {question.question_type === 'true_false' && (
        <>
          <button onClick={() => handleAnswer('O')}>O</button>
          <button onClick={() => handleAnswer('X')}>X</button>
        </>
      )}
    </div>
  );
}
