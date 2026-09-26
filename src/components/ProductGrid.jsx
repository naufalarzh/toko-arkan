import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, activeVariants, matchedVariantMap, searchQuery, onVariantChange, onAddToCart }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 mt-4 shadow-sm">
        <div className="text-5xl mb-3">🔍</div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Barang tidak ditemukan</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => {
        const activeIndex = activeVariants[product.id] ?? 0;
        const isMatched = matchedVariantMap[product.id] === activeIndex && searchQuery.trim();

        return (
          <ProductCard
            key={product.id}
            product={product}
            activeVariantIndex={activeIndex}
            isMatched={isMatched}
            onVariantChange={(idx) => onVariantChange(product.id, idx)}
            onAddToCart={() => onAddToCart(product)}
          />
        );
      })}
    </div>
  );
}
