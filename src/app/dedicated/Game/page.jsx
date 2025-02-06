"use client";
import React, { useRef, useState, useEffect } from "react";

const prizes = [
  { text: "🍔 Free Meal", color: "#FFD700" },
  { text: "🎁 Gift", color: "#9370DB" },
  { text: "📱 iPhone", color: "#FF6B6B" },
  { text: "🎟 Movie Ticket", color: "#4169E1" },
  { text: "💵 $500", color: "#3CB371" },
  { text: "💰 $100", color: "#FFA500" },
  
];

const SPIN_DURATION = 4000;
const MIN_SPINS = 5;

export default function Wheel() {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const totalSlices = prizes.length;
  const anglePerSlice = 360 / totalSlices;

  useEffect(() => {
    drawWheel();
  }, [rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const startOffset = 270;
    
    prizes.forEach((prize, index) => {
      const startAngle = ((index * anglePerSlice) + rotation + startOffset) * Math.PI / 180;
      const endAngle = ((index + 1) * anglePerSlice + rotation + startOffset) * Math.PI / 180;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + (anglePerSlice * Math.PI / 180) / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#000";
      ctx.font = "bold 16px Arial";
      ctx.fillText(prize.text, radius - 20, 6);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
  };

  const easeOut = (t) => {
    return 1 - Math.pow(1 - t, 3);
  };

  const animate = (currentTime) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
    }
  
    const elapsed = currentTime - startTimeRef.current;
    const progress = Math.min(elapsed / SPIN_DURATION, 1);
  
    if (progress < 1) {
      const targetRotation = 360 * MIN_SPINS + Math.random() * 360;
      const currentRotation = targetRotation * easeOut(progress);
      setRotation(currentRotation);
  
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsSpinning(false);
  
      // New prize calculation logic
      let finalRotation = (rotation % 360 + 360) % 360;
  
      // Adjust rotation to align the pointer (add 90 degrees since pointer is at the top)
      let adjustedRotation = (finalRotation + 90) % 360;
  
      // Calculate the prize index based on adjusted rotation
      const winningIndex = Math.floor(adjustedRotation / anglePerSlice) % totalSlices;
  
      console.log('Adjusted rotation:', adjustedRotation);
      console.log('Winning index:', winningIndex);
      console.log('Prize:', prizes[winningIndex].text);
  
      alert(`🎉 恭喜你獲得：${prizes[winningIndex].text}`);
    }
  };
  

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">🎡 幸運轉盤</h2>
      
      <div className="relative inline-block">
        <canvas 
          ref={canvasRef}
          width="400"
          height="400"
          className="rounded-full border-4 border-gray-800"
        />
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 
                     border-x-8 border-x-transparent border-t-[20px] border-t-red-500"
          style={{ transform: 'translateX(-50%) translateY(-50%)' }}
        />
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`
          px-6 py-3 text-xl font-bold text-white rounded-lg
          ${isSpinning 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 active:bg-green-700'}
          transition-colors
        `}
      >
        {isSpinning ? '旋轉中...' : '🎯 開始抽獎'}
      </button>
    </div>
  );
}