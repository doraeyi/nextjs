"use client"
import React from 'react';
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Meteors = ({ number = 20 }) => {
  const [meteorStyles, setMeteorStyles] = useState([]);

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      top: Math.floor(Math.random() * 100) + "%",
      left: Math.floor(Math.random() * 100) + "%",
      animationDelay: Math.random() * 1 + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * 8 + 2) + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className={cn(
            "pointer-events-none absolute size-0.5 rotate-[215deg] animate-meteor rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10]"
          )}
          style={style}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-slate-500 to-transparent" />
        </span>
      ))}
    </>
  );
};

const MeteorsContainer = ({ children }) => {
  return (
    <div className="relative overflow-hidden bg-slate-950 p-8 rounded-lg">
      <Meteors number={20} />
      <div className="relative z-10 text-white">
        {children}
      </div>
    </div>
  );
};

export default function Demo() {
  return (
    <MeteorsContainer>
      <h1 className="text-4xl font-bold mb-4">MeowTrade</h1>
      
    </MeteorsContainer>
  );
}