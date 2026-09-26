import React from "react";

export default function ConfirmDialog({ open, title = "Konfirmasi", message, confirmLabel = "Hapus", cancelLabel = "Batal", onConfirm, onCancel, variant = "danger" }) {
  if (!open) return null;

  const confirmClass = variant === "danger" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
              variant === "danger" ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600" : "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600"
            }`}
          >
            {variant === "danger" ? "⚠️" : "❓"}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-2xl font-bold text-white transition shadow-lg ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
