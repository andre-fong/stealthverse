"use client";

import React, { useState, useEffect } from "react";
import Typography from "@/components/Typography";

interface MainPageProps {
  onBalance: () => void;
  onTransfer: () => void;
}

export function MainPage({ onBalance, onTransfer }: MainPageProps) {
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Wait for the emblem's transition to finish before revealing options
    const timer = setTimeout(() => setShowOptions(true), 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* ── Dashboard (always in the DOM) ── */}
      <main className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -translate-x-74">
        {/* BALANCE OPTION */}
        <button
          onClick={onBalance}
          className={`ml-48 relative cursor-pointer text-left block origin-left transition-all duration-250 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-110 group ${showOptions ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
        >
          {/* Red angled slash background (behind black) */}
          <div
            className="absolute inset-0 bg-primary-container -inset-x-6 -inset-y-8 scale-y-[2.9] scale-x-[1.7] translate-y-5"
            style={{
              clipPath: "polygon(0 51%, 95% 23%, 92% 43%, 0 64%)",
            }}
          />
          {/* Black angled slash background */}
          <div
            className="absolute inset-0 bg-black group-hover:bg-primary-container -inset-x-6 -inset-y-8 scale-y-[2.8] scale-x-[1.3] transition-colors duration-200"
            style={{
              clipPath: "polygon(0 51%, 89% 17%, 92% 42%, 0 64%)",
            }}
          />
          {/* Content */}
          <div className="relative -rotate-11 -top-4 left-6">
            <Typography
              className="font-black text-5xl -rotate-4"
              highlightArray={[4]}
              rotateMap={{ 1: 3, 2: -8, 6: -5 }}
              skewMap={{ 4: -10 }}
            >
              BALANCE
            </Typography>
            <p className="text-md font-bold font-inter tracking-tighter scale-y-[1.6] pl-4">
              Check stealth account funds
            </p>
          </div>
        </button>

        {/* TRANSFER OPTION */}
        <button
          onClick={onTransfer}
          className={`ml-48 relative mt-8 cursor-pointer text-left block origin-left transition-all duration-250 delay-50 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-110 group ${showOptions ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
        >
          {/* Red angled slash background (behind black) */}
          <div
            className="absolute inset-0 bg-primary-container -inset-x-6 -inset-y-8 scale-y-[2.2] scale-x-[1.3] translate-y-5"
            style={{
              clipPath: "polygon(0 31%, 90% 52%, 76% 80%, 0 50%)",
            }}
          />
          {/* Black angled slash background */}
          <div
            className="absolute inset-0 bg-black group-hover:bg-primary-container -inset-x-6 -inset-y-8 scale-y-[1.9] scale-x-[1.8] transition-colors duration-200"
            style={{
              clipPath: "polygon(0 31%, 90% 52%, 76% 80%, 0 50%)",
            }}
          />
          {/* Content */}
          <div className="relative rotate-11 top-10 left-5">
            <Typography
              className="font-black text-5xl"
              highlightArray={[0, 5]}
              rotateMap={{ 1: 13, 3: 5, 7: -4 }}
              skewMap={{ 5: 10 }}
            >
              TRANSFER
            </Typography>
            <p className="text-xl font-bold font-inter tracking-tighter scale-y-[1.5] pl-3 rotate-7 pt-2">
              Send funds
            </p>
          </div>
        </button>

        {/* Background slashes */}
        <div
          className={`absolute -top-42 -left-32 w-48 h-48 bg-primary-container transition-all duration-200 ease-out ${showOptions ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
          style={{
            clipPath: "polygon(53% 3%, 46% 8%, 100% 100%)",
          }}
        />
        <div
          className={`absolute -top-38 -left-40 w-48 h-48 bg-primary-container -rotate-55 scale-y-[1.5] transition-all duration-200 ease-out ${showOptions ? "opacity-100" : "opacity-0 scale-50"}`}
          style={{
            clipPath:
              "polygon(28% 100%, 27% 14%, 34% 14%, 32% 58%, 38% 58%, 37% 76%, 42% 77%, 41% 100%)",
          }}
        />
        <div
          className={`absolute top-35 -left-40 w-48 h-48 bg-primary-container scale-x-[1.5] scale-y-[2] transition-all duration-200 ease-out ${showOptions ? "opacity-100" : "opacity-0 scale-50"}`}
          style={{
            clipPath:
              "polygon(82% 12%, 34% 32%, 45% 52%, 23% 69%, 24% 72%, 66% 46%, 69% 48%, 42% 75%, 43% 77%, 96% 30%)",
          }}
        />
      </main>
    </div>
  );
}

export default MainPage;
