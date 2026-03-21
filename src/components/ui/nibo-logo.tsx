import React from 'react';

export function NiboLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <circle cx="100" cy="60" r="35" fill="#00338D"/>
      <circle cx="60" cy="140" r="35" fill="#00338D"/>
      <circle cx="140" cy="140" r="35" fill="#00338D"/>
      <path 
        d="M100 60 Q 100 100 60 140" 
        stroke="#00338D" 
        strokeWidth="45" 
        strokeLinecap="round"
      />
      <path 
        d="M100 60 Q 100 100 140 140" 
        stroke="#00338D" 
        strokeWidth="45" 
        strokeLinecap="round"
      />
      <path 
        d="M60 140 Q 100 140 140 140" 
        stroke="#00338D" 
        strokeWidth="45" 
        strokeLinecap="round"
      />
    </svg>
  );
}
