import React from 'react';

export function NiboLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={{ objectFit: 'contain' }}
    >
      <circle cx="100" cy="55" r="30" fill="#00338D"/>
      <circle cx="55" cy="145" r="30" fill="#00338D"/>
      <circle cx="145" cy="145" r="30" fill="#00338D"/>
      <path 
        d="M100 55 L 55 145 L 145 145 Z" 
        stroke="#00338D" 
        strokeWidth="35" 
        strokeLinejoin="round" 
        strokeLinecap="round"
      />
    </svg>
  );
}
