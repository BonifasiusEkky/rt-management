import React from "react";

const STATUS_STYLES = {
  menunggu: 'bg-orange-50 text-orange-600',
  tunggakan: 'bg-red-50 text-red-600',
  lunas: 'bg-emerald-50 text-emerald-600',
  sebagian: 'bg-blue-50 text-blue-600',
};

export default function Badge({ children, status = 'menunggu', className = '' }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.menunggu} ${className}`}>
      {children}
    </span>
  );
}
