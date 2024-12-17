// pages/calculator.js
"use client";
import { useState } from 'react';

export default function Calculator() {
  const [input, setInput] = useState(""); // 儲存目前的輸入
  const [result, setResult] = useState(null); // 儲存計算結果
  const [date, setDate] = useState(new Date()); // 當前選定日期
  const [mode, setMode] = useState("支出"); // 切換模式（支出或收入）
 // 日期格式化函式
  const formatDate = (date) => {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const taiwanYear = date.getFullYear() - 1911; // 民國年
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${taiwanYear}/${month}/${day} 星期${weekday}`;
};
// 切換到「隔天」
const handlePrevDay = () => {
  setDate((prevDate) => {
    const newDate = new Date(prevDate);
    newDate.setDate(newDate.getDate() - 1);
    return newDate;
  });
};
 // 切換到「明天」
 const handleNextDay = () => {
  setDate((prevDate) => {
    const newDate = new Date(prevDate);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  });
};

  // 處理按鍵點擊
  const handleButtonClick = (value) => {
    setInput((prevInput) => prevInput + (value === 'X' ? '*' : value)); // 將 X 替換為 *
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
  
  // 刪除最後一個字元
  const handleDelete = () => {
    setInput((prevInput) => prevInput.slice(0, -1));
  };

  return (
    <div>
      {/* 模式切換按鈕 */}
      <div style={{ display: "flex", marginBottom: "20px", borderRadius: "10px", overflow: "hidden", border: "1px solid #ccc" ,width:"200px",margin: "0 auto"}}>
        <button
          onClick={() => setMode("支出")}
          style={{ flex: 1,borderRadius: "10px", padding: "3px 0", backgroundColor: mode === "支出" ? "rgb(255 201 82)" : "#f0f0f0", color: mode === "支出" ? "#000" : "#555", fontWeight: "bold", border: "none", cursor: "pointer" }}
        >
          支出
        </button>
        <button
          onClick={() => setMode("收入")}
          style={{ flex: 1,borderRadius: "10px", padding: "3px 0", backgroundColor: mode === "收入" ? "rgb(71 184 224)" : "#f0f0f0", color: mode === "收入" ? "#fff" : "#555", fontWeight: "bold", border: "none", cursor: "pointer" }}
        >
          收入
        </button>
      </div>

      {/* 顯示當前模式 */}
      <div style={{ fontSize: "18px", marginBottom: "10px", textAlign: "center" }}>
  {mode === "支出" ? (
    <div>
      <span style={{ marginRight: "10px" }}>
        🍞 {/* 麵包 icon */}
      </span>
      <span>
        🍛 {/* 晚餐 icon */}
      </span>
    </div>
  ) : (
    <div>
      <span style={{ marginRight: "10px" }}>
        💤 {/* 心睡 icon */}
      </span>
      <span>
        📈 {/* 股票 icon */}
      </span>
    </div>
  )}
</div>
    <div
    style={{
      position: "fixed", // 固定位置
      bottom: "90px", // 距離底部 20px
      left: "50%", // 水平居中的起點
      transform: "translateX(-50%)", // 偏移自身寬度的一半，達到水平完全居中
      padding: "20px",
      maxWidth: "370px",
      backgroundColor: "hsl(41.27deg 100% 66.08%)", // 背景色
      boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)", // 陰影效果
      borderRadius: "10px", // 邊框圓角
    }}
  >
    
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
        {result !== null && <div style={{ fontSize: '20px', marginBottom: '10px' }}>{result}</div>}
      </div>
      {/* 日期選擇器 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          padding: "0px 10px",
          borderRadius: "30px",
          backgroundColor: "#f7f7f7",
          boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
          border: '1px solid #000',
        }}
      >
        <button
          onClick={handlePrevDay}
          style={{
            padding: "5px",
            borderRadius: "50%",
            
            cursor: "pointer",
          }}
        >
          &lt;
        </button>
        <div style={{ fontSize: "16px", textAlign: "center" }}>
          {formatDate(date)}
        </div>
        <button
          onClick={handleNextDay}
          style={{
            padding: "10px",
            borderRadius: "50%",
           
            cursor: "pointer",
          }}
        >
          &gt;
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {['7', '8', '9', '÷', 'AC', '4','5', '6', 'X', '<-','1', '2', '3', '+', '00',  '0','.','-'].map((button) => (
          <button
            key={button}
            onClick={() => {
              if (button === 'OK') {
                handleCalculate();
              } else if (button === 'AC') {
                handleClear();
              } else if (button === '<-') {
                handleDelete();
              } else if (button === '÷') {
                handleButtonClick('/');
              } else {
                handleButtonClick(button);
              }
            }}
            style={{
              padding: '20px',
              fontSize: '18px',
              cursor: 'pointer',
              backgroundColor: '#f0f0f0',
              border: '1px solid #000',
              borderRadius: '50%', // 這裡將按鈕設為圓形
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '60px',  // 調整高度，使按鈕呈圓形
              width: '60px',   // 調整寬度，使按鈕呈圓形
              backgroundColor: ['÷', 'AC', '+', 'X', '<-', '=', '-'].includes(button) ? "hsl(195.69deg 71.16% 57.84%)" : "#f0f0f0", // 動態設定背景色
              color: ['÷', 'AC', '+', 'X', '<-', '=', '-'].includes(button) ? "#fff" : "#000", // 設定文字顏色（藍色背景用白色字體）
            }}

            
          >
            {button}
          </button>
          
        ))}
         <button
    onClick={handleCalculate}
    style={{
      gridColumn: '5', // 放在第5列
      gridRow: '3 / span 2', // 從第4行開始，跨越2行
      backgroundColor: 'hsl(0.43deg 100% 72.35%)', // 背景色
      color: '#fff', // 字體顏色
      fontSize: '20px', // 字體大小
      cursor: 'pointer',
      border: '1px solid #ccc',
      borderRadius: '50px', // 橢圓形外觀
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '130px', // 橢圓形按鈕高度
      width: '60px', // 橢圓形按鈕寬度
    }}
  >
    OK
  </button>
      </div>
    </div>
    </div>
  );
}