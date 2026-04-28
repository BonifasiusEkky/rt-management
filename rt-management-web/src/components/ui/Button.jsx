import React from "react";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "rounded-xl text-white bg-slate-900 hover:bg-slate-800",
    secondary: "bg-white border border-gray-100 text-slate-600 rounded-xl hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 rounded-xl border border-red-100",
  };

  const base = "px-6 py-2.5 font-bold text-xs uppercase tracking-widest focus:outline-none transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2";

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
