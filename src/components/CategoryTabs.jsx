import React from "react";
import { CATEGORIES } from "../constants/categories";

export default function CategoryTabs({ selectedCategory, onSelect }) {
  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Gradient fade di kanan sebagai indikator scroll */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 sm:hidden" />

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 sm:gap-2 border flex-shrink-0 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-600"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
              }`}
            >
              <span className="text-sm sm:text-base leading-none">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}