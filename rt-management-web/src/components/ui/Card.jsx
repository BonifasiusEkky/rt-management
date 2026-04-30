import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-card rounded-xl border border-gray-100 shadow-soft p-6 ${className}`}>
      {children}
    </div>
  );
}
