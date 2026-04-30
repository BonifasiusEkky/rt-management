import React from 'react';

export default function Skeleton({ className = '', w = 'full', h = '4' }) {
  const widthClass = w === 'full' ? 'w-full' : w;
  const heightClass = h.startsWith('h-') ? h : `h-${h}`;
  
  return (
    <div 
      className={`animate-pulse bg-gray-100 rounded-lg ${widthClass} ${heightClass} ${className}`} 
    />
  );
}
