import React from "react";

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] animate-toast-in">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 border border-slate-200 dark:border-slate-800 min-w-[280px]">
        {/* IKON CEKLIS SVG BARU */}
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Ditambahkan ke keranjang</p>
          <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">
            {toast.name} {toast.variantName}
          </p>
        </div>
      </div>
    </div>
  );
}
