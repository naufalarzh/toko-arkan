import React from "react";
import { LIST_KATEGORI } from "../../utils/constants";

const KategoriBar = ({ kategoriAktif, setKategoriAktif }) => {
  return (
    <div className="sticky top-16 z-20 bg-[#151D35] border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
        {LIST_KATEGORI.map((kat) => (
          <button
            key={kat}
            onClick={() => setKategoriAktif(kat)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              kategoriAktif === kat ? "bg-emerald-500 text-[#0B1329]" : "bg-[#1C2541] text-slate-300 border border-slate-800"
            }`}
          >
            {kat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default KategoriBar;
