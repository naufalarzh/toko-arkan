import React from "react";
import { resolveImage, handleImageError } from "../utils/resolveImage";

export default function ProductCard({ product, activeVariantIndex, isMatched, onVariantChange, onAddToCart }) {
  const currentVariant = product.variants[activeVariantIndex];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/50 group transition-all duration-300 flex flex-row sm:flex-col">
      {/* ===== Gambar ===== */}
      <div className="relative w-24 sm:w-full aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden flex-shrink-0">
        <img src={resolveImage(currentVariant.image, 600)} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={handleImageError} />
        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border border-slate-200 dark:border-slate-800 shadow-sm z-10">
          {product.category}
        </span>
      </div>

      {/* ===== Info ===== */}
      <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base mb-0.5 leading-tight line-clamp-2">{product.name}</h3>

          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2 flex items-center gap-1.5 flex-wrap">
            <span>{currentVariant.typeName}</span>
            {isMatched && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">✓ cocok</span>}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Harga</span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-none truncate">{currentVariant.price}</div>
            </div>

            <div className="flex flex-wrap items-center gap-1 justify-end max-w-[100px] flex-shrink-0">
              {product.variants.map((variant, idx) => {
                const isActive = idx === activeVariantIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => onVariantChange(idx)}
                    title={variant.typeName}
                    className={`w-5 h-5 rounded-full ${variant.colorClass} flex items-center justify-center text-[9px] font-extrabold text-white transition-all duration-200 ${
                      isActive ? "ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-900 scale-110 shadow-md" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onAddToCart}
            className="mt-2 sm:mt-3 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
          >
            <span className="text-sm sm:text-base leading-none">+</span> Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
