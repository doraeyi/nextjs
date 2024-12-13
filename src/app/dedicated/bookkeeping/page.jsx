// pages/calculator.js
"use client";
import { useState } from 'react';

export default function Calculator() {
  const [input, setInput] = useState(""); // 儲存目前的輸入
  const [result, setResult] = useState(null); // 儲存計算結果

  // 處理按鍵點擊
  const handleButtonClick = (value) => {
    setInput((prevInput) => prevInput + value);
  };

  // 處理計算
  const handleCalculate = () => {
    try {
      // 使用 JavaScript 的 eval() 進行計算
      setResult(eval(input));
    } catch (error) {
      setResult("錯誤");
    }
  };

  // 清空輸入
  const handleClear = () => {
    setInput("");
    setResult(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: 'auto' }}>
      
      <div>
        <input 
          type="text" 
          value={input} 
          readOnly 
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '20px',
            textAlign: 'right',
            marginBottom: '10px',
          }} 
        />
        {result !== null && <div style={{ fontSize: '20px', marginBottom: '10px' }}>結果: {result}</div>}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', '*', '0', '=', '/','C'].map((button) => (
          <button
            key={button}
            onClick={() => {
              if (button === '=') {
                handleCalculate();
              } else if (button === 'C') {
                handleClear();
              } else {
                handleButtonClick(button);
              }
            }}
            style={{
              padding: '20px',
              fontSize: '18px',
              cursor: 'pointer',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '50%', // 這裡將按鈕設為圓形
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '60px',  // 調整高度，使按鈕呈圓形
              width: '60px',   // 調整寬度，使按鈕呈圓形
            }}
          >
            {button}
          </button>
        ))}
      </div>
    </div>
  );
}