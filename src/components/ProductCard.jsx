import React from "react";
import { resolveImage, handleImageError } from "../utils/resolveImage";

export default function ProductCard({ product, activeVariantIndex, isMatched, onVariantChange, onAddToCart }) {
  const currentVariant = product.variants[activeVariantIndex];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-indigo-500/50 group transition-all duration-300">
      <div>
        {/* Container: aspect-square, gambar object-cover, background putih/slate */}
        <div className="relative aspect-square bg-white dark:bg-slate-900 overflow-hidden w-full">
          <img
            src={resolveImage(currentVariant.image, 600)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
          />

          <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border border-slate-200 dark:border-slate-800 shadow-sm z-10">
            {product.category}
          </span>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1 tracking-tight">{product.name}</h3>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-3 flex items-center gap-1.5 flex-wrap">
            <span>{currentVariant.typeName}</span>
            {isMatched && <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">✓ cocok</span>}
          </p>

          <div className="flex items-end justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Harga</span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">{currentVariant.price}</div>
            </div>

            <div className="flex flex-wrap items-center gap-1 justify-end max-w-[120px]">
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
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-bold py-2.5 rounded-2xl transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <span className="text-base leading-none">+</span> Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
