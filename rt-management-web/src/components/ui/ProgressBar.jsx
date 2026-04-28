import React from "react";

export default function ProgressBar({ value, max }) {
  const safeMax = Number(max) || 0;
  const safeValue = Number(value) || 0;
  const percent = safeMax > 0 ? Math.round((safeValue / safeMax) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 mb-2 overflow-hidden">
      <div
        className="h-full bg-slate-900 transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
