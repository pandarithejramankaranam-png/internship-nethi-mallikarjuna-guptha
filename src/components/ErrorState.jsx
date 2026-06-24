import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ 
  title = "Something went wrong", 
  message = "We encountered a network or server error while retrieving data. Please check your connection and try again.", 
  onRetry 
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-2xl bg-rose-50/30 min-h-[300px] max-w-lg mx-auto my-6">
      <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 shadow-sm">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="font-bold text-slate-800 text-base mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
