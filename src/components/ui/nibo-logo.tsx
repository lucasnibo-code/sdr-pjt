
import React from 'react';

export function NiboLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 460 160" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <circle cx="53" cy="115" r="28" fill="#00338D"/>
      <circle cx="120" cy="50" r="35" fill="#00338D"/>
      <circle cx="210" cy="115" r="35" fill="#00338D"/>
      <path d="M120 50L210 115" stroke="#00338D" strokeWidth="55" strokeLinecap="round"/>
      <path d="M265 50V135M265 85C275 65 305 65 315 85V135M340 50V135M365 50V135M390 85C390 65 420 65 435 85C450 105 450 120 450 135V135M390 135V85" stroke="#00338D" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="340" cy="30" r="8" fill="#00338D"/>
    </svg>
  );
}
