import React from "react";
import { formatPrice } from "../utils/helpers";
import { resolveImage, handleImageError } from "../utils/resolveImage";

export default function CartPanel({ show, onClose, cart, totalItems, totalPrice, onUpdateQty, onRemove, onClearCart, onCheckout }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Keranjang Belanja</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalItems} item • {formatPrice(totalPrice)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center justify-center text-lg font-bold flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Keranjang masih kosong</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Yuk tambahkan barang dari katalog!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={`${item.productId}-${item.variantName}-${idx}`} className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                  <img
                    src={resolveImage(item.image, 200)}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                    onError={handleImageError}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1.5">{item.variantName}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{formatPrice(item.priceNumber * item.qty)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQty(item.productId, item.variantName, -1)}
                          className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center transition"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(item.productId, item.variantName, 1)}
                          className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(item.productId, item.variantName)}
                    className="self-start text-xs font-bold text-rose-500 hover:text-rose-700 transition px-1 py-0.5"
                    title="Hapus item"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Item</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{totalItems} pcs</span>
            </div>
            <div className="flex items-center justify-between mb-4 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-base font-bold text-slate-700 dark:text-slate-200">Total Harga</span>
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
            >
              Checkout Sekarang
            </button>
            <button onClick={onClearCart} className="w-full mt-2 text-xs text-rose-500 hover:text-rose-700 font-semibold py-2 transition">
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
