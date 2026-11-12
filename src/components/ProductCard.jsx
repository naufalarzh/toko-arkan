import React from "react";
import { resolveImage, handleImageError } from "../utils/resolveImage";

export default function ProductCard({ product, activeVariantIndex, isMatched, onVariantChange, onAddToCart, isPriority }) {
  const currentVariant = product.variants[activeVariantIndex];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-600/50 transition-all duration-300 flex flex-row sm:flex-col group">
      {/* ===== Gambar ===== */}
      <div className="relative w-28 sm:w-full aspect-square bg-slate-50 dark:bg-slate-950 overflow-hidden flex-shrink-0 border-b border-slate-100 dark:border-slate-800/60">
        <img
          src={resolveImage(currentVariant.image, 600)}
          alt={product.name}
          width="400"
          height="400"
          fetchPriority={isPriority ? "high" : "auto"}
          loading={isPriority ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={handleImageError}
        />
        {/* Label Kategori sudah dihilangkan dari sini */}
      </div>

      {/* ===== Info ===== */}
      <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between">
        {/* Nama & Varian */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-[15px] mb-1 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{currentVariant.typeName}</span>
            {isMatched && (
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                ✓ Cocok
              </span>
            )}
          </div>
        </div>

        {/* Harga & Tombol */}
        <div className="mt-auto">
          <div className="flex items-end justify-between gap-2 mb-3">
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Harga</span>
              <div className="text-base sm:text-lg font-extrabold text-indigo-600 dark:text-indigo-400 leading-none truncate">{currentVariant.price}</div>
            </div>

            {/* Pilihan Varian (Angka) */}
            <div className="flex flex-wrap items-center gap-1.5 justify-end max-w-[100px] flex-shrink-0">
              {product.variants.map((variant, idx) => {
                const isActive = idx === activeVariantIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => onVariantChange(idx)}
                    title={variant.typeName}
                    className={`w-6 h-6 rounded-md ${variant.colorClass} flex items-center justify-center text-[10px] font-bold text-white transition-all duration-200 ${
                      isActive ? "ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-900 scale-110 shadow-sm" : "opacity-60 hover:opacity-100"
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
            className="w-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 hover:text-white dark:hover:text-white active:scale-[0.98] text-xs sm:text-sm font-bold py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <span className="text-sm leading-none">+</span> Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
