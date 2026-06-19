import React from "react";

const Navbar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="sticky top-0 z-30 bg-[#1A1128]/80 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500 p-2 rounded-xl text-[#0F0A1A]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">TOKO ARKAN</h1>
        </div>

        <div className="w-44 sm:w-64 relative">
          <input
            type="text"
            placeholder="Cari barang...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F0A1A] text-xs sm:text-sm text-slate-200 pl-9 pr-3 py-1.5 sm:py-2 rounded-xl border border-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 placeholder-slate-500 transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs bg-amber-500/20 text-amber-400 hover:text-white w-4 h-4 rounded-full flex items-center justify-center font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
