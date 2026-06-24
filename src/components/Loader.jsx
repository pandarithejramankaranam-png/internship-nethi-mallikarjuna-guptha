import React from 'react';

export default function Loader({ message = "Loading details..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-[300px]">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-semibold text-slate-500 tracking-wide animate-pulse">{message}</p>
    </div>
  );
}
