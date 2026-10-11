import React from 'react';

export default function EcpLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25 ${className}`}>
      <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
        {/* Ambient subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent pointer-events-none" />
        
        {/* Monogram ECP */}
        <div className="flex items-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-200 to-cyan-300 font-mono select-none px-1">
          <span className="text-[15px] font-extrabold text-sky-400">E</span>
          <span className="text-[13px] font-bold text-indigo-300 -mx-[1px]">C</span>
          <span className="text-[15px] font-extrabold text-cyan-300">P</span>
        </div>

        {/* Mini dot */}
        <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </div>
  );
}
