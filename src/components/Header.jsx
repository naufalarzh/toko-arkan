import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoArkan from "../../public/Logo.png";

export default function Header({ searchQuery, setSearchQuery, totalItems, onOpenCart }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate("/admin");
    } else {
      navigate("/admin/login");
    }
  };

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* DESKTOP LAYOUT */}
        <div className="hidden sm:flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <img src={logoArkan} alt="Toko Arkan" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Toko Arkan</span>
          </div>

          {/* Search, Menu, Icons */}
          <div className="flex items-center gap-6">
            <div className="relative w-48 lg:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="Cari barang..."
                className="w-full pl-7 pr-7 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all duration-300"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery && setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>

            <nav className="flex items-center gap-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"}`
                }
              >
                Harga
              </NavLink>
              <NavLink
                to="/hutang"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"}`
                }
              >
                Hutang
              </NavLink>
            </nav>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>

            <div className="flex items-center gap-4">
              <button onClick={onOpenCart || (() => {})} className="relative p-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={handleAdminClick} className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span className="text-sm font-bold hidden lg:block">Admin</span>
                  </>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="flex flex-col sm:hidden py-3 gap-3">
          {/* Baris 1: Logo & Menu Kanan */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-9 h-9 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <img src={logoArkan} alt="Toko Arkan" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Toko Arkan</span>
            </div>

            {/* Menu & Ikon Kanan */}
            <div className="flex items-center gap-3">
              {/* Menu Harga & Hutang */}
              <nav className="flex items-center gap-3 mr-1">
                <NavLink to="/" className={({ isActive }) => `text-xs font-semibold transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}`}>
                  Harga
                </NavLink>
                <NavLink
                  to="/hutang"
                  className={({ isActive }) => `text-xs font-semibold transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}`}
                >
                  Hutang
                </NavLink>
              </nav>

              {/* Ikon Cart & Login */}
              <button onClick={onOpenCart || (() => {})} className="relative p-1 text-slate-700 dark:text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-[8px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={handleAdminClick} className="p-1 text-slate-700 dark:text-slate-300">
                {isAuthenticated ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Baris 2: Search Bar Full Width */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pl-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Cari barang..."
              className="w-full pl-9 pr-9 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery && setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Hapus pencarian"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
