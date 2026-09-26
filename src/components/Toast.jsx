import React from "react";

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] animate-toast-in">
      <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-3 border border-slate-700 dark:border-slate-200 min-w-[280px]">
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg flex-shrink-0">✓</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ditambahkan ke keranjang</p>
          <p className="text-sm font-bold truncate">
            {toast.name} {toast.variantName}
          </p>
        </div>
      </div>
    </div>
  );
}
