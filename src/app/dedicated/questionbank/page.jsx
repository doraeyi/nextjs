'use client';
import React, { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera } from 'lucide-react';

const QuestionCreator = () => {
  const [questionType, setQuestionType] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newQuestion = {
        type: questionType,
        text: question,
        answer: answer,
        options: questionType === 'multiple' ? options.filter(Boolean) : undefined
      };

      setSubmittedQuestions([...submittedQuestions, newQuestion]);

      setQuestionType('');
      setQuestion('');
      setAnswer('');
      setOptions(['', '', '', '']);

      alert('問題已成功提交！');
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('提交問題時發生錯誤。請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPractice = () => {
    setPracticeMode(true);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setFeedback(null);
  };

  const handlePracticeAnswer = () => {
    const currentQuestion = submittedQuestions[currentQuestionIndex];
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
    
    setFeedback({
      isCorrect,
      message: isCorrect ? '答對了！' : '答錯了。正確答案是：' + currentQuestion.answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < submittedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      alert('你已完成所有題目！');
      setPracticeMode(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleImageCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 这里可以添加图像处理和文字识别的逻辑
      // 为了演示，我们只是将文件名设置为问题文本
      setQuestion(`Scanned text from: ${file.name}`);
    }
  };

  return (
    <div className="space-y-8">
      {!practiceMode ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select onValueChange={setQuestionType}>
              <SelectTrigger>
                <SelectValue placeholder="選擇題目類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple">選擇題</SelectItem>
                <SelectItem value="truefalse">是非題</SelectItem>
                <SelectItem value="shortanswer">問答題</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <textarea
                className="w-full p-2 border rounded"
                placeholder="輸入題目"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button type="button" onClick={handleCameraClick} className="p-2">
                <Camera size={24} />
              </Button>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            {questionType === 'multiple' && (
              <div className="space-y-2">
                {options.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`選項 ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                ))}
              </div>
            )}

            {questionType === 'truefalse' && (
              <Select onValueChange={setAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇答案" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">O</SelectItem>
                  <SelectItem value="false">X</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(questionType === 'shortanswer' || questionType === 'multiple') && (
              <textarea
                className="w-full p-2 border rounded"
                placeholder="輸入答案"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交'}
            </Button>
          </form>

          <div>
            <h2 className="text-xl font-bold mb-4">已提交的題目</h2>
            {submittedQuestions.map((q, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <p><strong>類型：</strong>{q.type}</p>
                <p><strong>問題：</strong>{q.text}</p>
                {q.type === 'multiple' && (
                  <div>
                    <strong>選項：</strong>
                    <ul>
                      {q.options.map((option, i) => (
                        <li key={i}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p><strong>答案：</strong>{q.answer}</p>
              </div>
            ))}
          </div>

          {submittedQuestions.length > 0 && (
            <Button onClick={startPractice}>開始練習</Button>
          )}
        </>
      ) : (
        <div className="practice-area space-y-4">
          <h2 className="text-xl font-bold">練習區</h2>
          <div className="question-display p-4 border rounded">
            <p><strong>問題：</strong>{submittedQuestions[currentQuestionIndex].text}</p>
            {submittedQuestions[currentQuestionIndex].type === 'multiple' && (
              <Select onValueChange={setUserAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇答案" />
                </SelectTrigger>
                <SelectContent>
                  {submittedQuestions[currentQuestionIndex].options.map((option, index) => (
                    <SelectItem key={index} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {submittedQuestions[currentQuestionIndex].type === 'truefalse' && (
              <Select onValueChange={setUserAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇答案" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">O</SelectItem>
                  <SelectItem value="false">X</SelectItem>
                </SelectContent>
              </Select>
            )}
            {submittedQuestions[currentQuestionIndex].type === 'shortanswer' && (
              <Input
                placeholder="輸入你的答案"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
            )}
          </div>
          <Button onClick={handlePracticeAnswer}>提交答案</Button>
          {feedback && (
            <Alert variant={feedback.isCorrect ? "default" : "destructive"}>
              <AlertTitle>{feedback.isCorrect ? "答對了！" : "答錯了"}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
          {feedback && <Button onClick={nextQuestion}>下一題</Button>}
        </div>
      )}
    </div>
  );
};

export default QuestionCreator;