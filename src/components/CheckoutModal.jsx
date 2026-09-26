import React from "react";
import { formatPrice } from "../utils/helpers";

const QUICK_AMOUNTS = [50000, 100000, 150000, 200000, 500000];

export default function CheckoutModal({ show, onClose, totalPrice, totalItems, cashInput, setCashInput, cashNumber, change, isCashEnough, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Pembayaran</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Masukkan uang yang diterima</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center justify-center text-lg font-bold flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 sm:p-5 text-white mb-4 sm:mb-5 shadow-lg shadow-indigo-500/20">
            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-1">Total Tagihan</p>
            <p className="text-2xl sm:text-3xl font-extrabold">{formatPrice(totalPrice)}</p>
            <p className="text-xs text-indigo-100 mt-1">{totalItems} item</p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Uang Diterima</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-bold">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={cashInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setCashInput(raw ? parseInt(raw, 10).toLocaleString("id-ID") : "");
                }}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                autoFocus
              />
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pilih Cepat</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCashInput(totalPrice.toLocaleString("id-ID"))}
                className="px-2 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-bold border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-950/60 transition"
              >
                Uang Pas
              </button>
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCashInput(amount.toLocaleString("id-ID"))}
                  className="px-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {amount >= 1000000 ? `${amount / 1000000}jt` : `${amount / 1000}rb`}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 sm:p-5 border-2 transition ${
              cashNumber === 0
                ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                : isCashEnough
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{cashNumber === 0 ? "Kembalian" : isCashEnough ? "Kembalian" : "Kurang"}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{cashNumber > 0 ? formatPrice(cashNumber) : "-"}</span>
            </div>
            <p className={`text-2xl sm:text-3xl font-extrabold ${cashNumber === 0 ? "text-slate-400" : isCashEnough ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {cashNumber === 0 ? "Rp 0" : isCashEnough ? formatPrice(change) : formatPrice(Math.abs(change))}
            </p>
            {cashNumber > 0 && !isCashEnough && <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">Uang kurang {formatPrice(Math.abs(change))}</p>}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={onConfirm}
            disabled={!isCashEnough}
            className={`w-full font-bold py-3 sm:py-3.5 rounded-2xl transition shadow-lg active:scale-[0.98] text-sm sm:text-base ${
              isCashEnough
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/30"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
            }`}
          >
            {isCashEnough ? "Konfirmasi Pembayaran" : "Uang Belum Cukup"}
          </button>
        </div>
      </div>
    </div>
  );
}
