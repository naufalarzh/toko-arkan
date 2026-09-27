import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { resolveImage, handleImageError } from "../../utils/resolveImage";

// Label untuk tiap kategori
const CATEGORY_LABELS = {
  all: "Semua Kategori",
  sembako: "Sembako",
  rokok: "Rokok",
  "alat-tulis": "Alat Tulis",
  listrik: "Listrik",
  lainnya: "Lainnya",
};

// 🎨 Warna badge per kategori
const CATEGORY_COLORS = {
  sembako: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
  rokok: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
  "alat-tulis": "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
  listrik: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
  lainnya: "bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

// Fallback untuk kategori baru yang belum terdaftar
const DEFAULT_CATEGORY_COLOR = "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900/50";

// Helper ambil warna badge
const getCategoryColor = (category) => CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;

export default function ProductList() {
  const { products, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const currentLabel = CATEGORY_LABELS[categoryFilter] || categoryFilter;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Daftar Produk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{products.length} produk total</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-5 py-3 rounded-2xl transition shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
        >
          <span>➕</span> Tambah Produk
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-rose-500 transition" title="Hapus pencarian">
              ✕
            </button>
          )}
        </div>

        {/* Custom Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full sm:w-52 flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <span className="flex items-center gap-2 truncate">
              {categoryFilter !== "all" && <span className={`w-2 h-2 rounded-full ${getCategoryColor(categoryFilter).split(" ")[0].replace("bg-", "bg-").replace("-100", "-500")}`}></span>}
              <span className="truncate">{currentLabel}</span>
            </span>
            <span className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 sm:left-0 sm:right-auto z-30 mt-2 w-full sm:w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
              {categories.map((c) => {
                const isActive = categoryFilter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(c);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition flex items-center justify-between ${
                      isActive ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {c !== "all" && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c === "sembako"
                              ? "bg-amber-500"
                              : c === "rokok"
                                ? "bg-rose-500"
                                : c === "alat-tulis"
                                  ? "bg-blue-500"
                                  : c === "listrik"
                                    ? "bg-yellow-500"
                                    : c === "lainnya"
                                      ? "bg-slate-500"
                                      : "bg-violet-500"
                          }`}
                        ></span>
                      )}
                      <span className="truncate">{CATEGORY_LABELS[c] || c}</span>
                    </span>
                    {isActive && <span className="text-indigo-600 dark:text-indigo-400 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Produk</th>
                <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Kategori</th>
                <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Varian</th>
                <th className="text-right px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-sm font-semibold">Tidak ada produk ditemukan</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImage(p.variants[0]?.image, 200)}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="w-12 h-12 rounded-xl object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          onError={handleImageError}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {/* ✅ Badge dengan warna per kategori */}
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(p.category)}`}>
                        {CATEGORY_LABELS[p.category] || p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{p.variants.length} varian</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{p.variants.map((v) => v.typeName).join(", ")}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-950 transition"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-950 transition"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Produk?"
        message={`Produk "${deleteTarget?.name}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
