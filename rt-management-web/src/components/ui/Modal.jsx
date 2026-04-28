import React from 'react';
import Card from './Card';

export default function Modal({ open, onClose, title, children, className = '' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full max-w-2xl ${className}`}>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
            <button
              type="button"
              aria-label="Tutup"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div>{children}</div>
        </Card>
      </div>
    </div>
  );
}
