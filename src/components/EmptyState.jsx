import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ 
  title = "No data found", 
  message = "There are currently no items available to display here.", 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-250 rounded-2xl bg-slate-50/50 min-h-[300px] max-w-lg mx-auto my-6">
      <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4 shadow-inner">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h3 className="font-bold text-slate-800 text-base mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
