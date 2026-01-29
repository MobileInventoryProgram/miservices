import React from 'react';

interface FiPoundSignProps {
  size?: number;
  className?: string;
}

export default function FiPoundSign({ size = 24, className = '' }: FiPoundSignProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 7c0-1.5-2-2.5-4-2.5-3 0-4 1.5-4 4v7c0 1-.5 1.5-2 1.5H6" />
      <line x1="6" y1="17" x2="18" y2="17" />
      <line x1="7" y1="11" x2="13" y2="11" />
    </svg>
  );
}
