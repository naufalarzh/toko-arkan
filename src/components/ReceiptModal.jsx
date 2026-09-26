import React from "react";
import { formatPrice } from "../utils/helpers";

export default function ReceiptModal({ receipt, onClose, onPrint }) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl mx-auto mb-3">✓</div>
          <h2 className="text-xl font-extrabold mb-1">Pembayaran Berhasil</h2>
          <p className="text-xs text-emerald-100">{receipt.date}</p>
          <p className="text-[10px] text-emerald-100 mt-1 font-mono">{receipt.invoiceNo}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Item Dibeli</p>
            <div className="space-y-2">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 truncate">
                      {item.variantName} × {item.qty}
                    </p>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{formatPrice(item.priceNumber * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{formatPrice(receipt.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Uang Diterima</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{formatPrice(receipt.cash)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-200">Kembalian</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatPrice(receipt.change)}</span>
            </div>
          </div>

          <div className="mt-5 text-center text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Terima kasih telah berbelanja di
            <br />
            <span className="font-bold">Toko Arkan</span>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-900 flex gap-2">
          <button
            onClick={onPrint}
            className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-2xl border border-slate-200 dark:border-slate-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            🖨️ Cetak Struk
          </button>
          <button onClick={onClose} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
