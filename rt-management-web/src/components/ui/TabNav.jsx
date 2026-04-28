import React from "react";

const TABS = [
  { key: "aktif", label: "Aktif" },
  { key: "tunggakan", label: "Tunggakan" },
  { key: "lunas", label: "Lunas" },
  { key: "history", label: "History" },
];

export default function TabNav({ active, onChange }) {
  return (
    <div className="flex gap-3 mb-4 bg-slate-50 p-1 rounded-full">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`py-2 px-4 text-sm font-medium rounded-md transition focus:outline-none ${
            active === tab.key
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
