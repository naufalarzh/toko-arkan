import React from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import logoArkan from "../assets/logo.png";

export default function Header({ searchQuery, setSearchQuery, totalItems, totalPrice, onOpenCart }) {
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
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-lg shadow-indigo-500/20 overflow-hidden flex-shrink-0">
              <img src={logoArkan} alt="Toko Arkan" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Toko Arkan
              </h1>
              <p className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium">Sembako, Top Up & Digital</p>
            </div>
          </div>

          <button
            onClick={handleAdminClick}
            className="sm:hidden flex items-center justify-center p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white transition"
            title={isAuthenticated ? "Dashboard Admin" : "Login Admin"}
          >
            {isAuthenticated ? <span className="text-base">👤</span> : <span className="text-base">🔑</span>}
          </button>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-initial sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari:"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-inner"
            />
          </div>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-lg shadow-indigo-500/20 flex-shrink-0"
            title="Buka Keranjang"
          >
            <span className="text-base">🛒</span>
            {totalItems > 0 && (
              <>
                <span className="text-sm font-bold hidden sm:inline">{formatPrice(totalPrice)}</span>
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {totalItems}
                </span>
              </>
            )}
          </button>

          <button
            onClick={handleAdminClick}
            className="hidden sm:flex items-center justify-center p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition group"
            title={isAuthenticated ? "Dashboard Admin" : "Login Admin"}
          >
            {isAuthenticated ? <span className="text-base">👤</span> : <span className="text-base">🔑</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
