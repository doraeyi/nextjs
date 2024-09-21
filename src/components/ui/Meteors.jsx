"use client";

import { useEffect, useState } from "react";

const Meteors = ({ number = 20 }) => {
  const [meteorStyles, setMeteorStyles] = useState([]);

  useEffect(() => {
    const styles = Array.from({ length: number }).map(() => ({
      top: Math.random() * -50 + "px", // Start above the viewport
      left: Math.random() * window.innerWidth + "px",
      animationDelay: Math.random() * 1 + "s",
      animationDuration: Math.random() * 3 + 2 + "s", // Random duration between 2s and 5s
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className="absolute rounded-full bg-slate-500 animate-meteor"
          style={{
            ...style,
            width: "2px",
            height: "20px",
            animationName: "fall",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </>
  );
};

export default Meteors;
