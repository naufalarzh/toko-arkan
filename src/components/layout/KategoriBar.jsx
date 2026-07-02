import React from "react";
import { LIST_KATEGORI } from "../../utils/constants";

const KategoriBar = ({ kategoriAktif, setKategoriAktif }) => {
  return (
    <div className="sticky top-16 z-30 bg-white border-b border-[#DADCE0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
        {LIST_KATEGORI.map((kat) => (
          <button
            key={kat}
            onClick={() => setKategoriAktif(kat)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              kategoriAktif === kat ? "bg-[#1A73E8] text-white" : "bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8EAED] hover:text-[#202124]"
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
