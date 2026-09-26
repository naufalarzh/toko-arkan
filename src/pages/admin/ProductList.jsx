import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { resolveImage, handleImageError } from "../../utils/resolveImage";

export default function ProductList() {
  const { products, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Daftar Produk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{products.length} produk total</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-5 py-3 rounded-2xl transition shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
        >
          <span>➕</span> Tambah Produk
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Semua Kategori" : c}
            </option>
          ))}
        </select>
      </div>

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
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                        {p.category}
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
