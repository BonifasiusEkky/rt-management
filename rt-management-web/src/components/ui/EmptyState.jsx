import React from "react";

export default function EmptyState({ icon, title, description, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {icon && <div className="mb-4">{icon}</div>}
      <div className="text-lg font-semibold mb-2 text-gray-700">{title}</div>
      <div className="text-gray-500 mb-4 text-center text-sm">{description}</div>
      {cta && <div>{cta}</div>}
    </div>
  );
}
