import React from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { parsePrice } from "../../utils/helpers";
import { resolveImage, handleImageError } from "../../utils/resolveImage";

const StatCard = ({ icon, label, value, colorClass }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className={`w-11 h-11 rounded-2xl ${colorClass} flex items-center justify-center text-xl text-white shadow-lg`}>{icon}</span>
    </div>
    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
  </div>
);

export default function Dashboard() {
  const { products } = useProducts();

  const totalProducts = products.length;
  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);

  const avgPrice = products.length ? Math.round(products.reduce((s, p) => s + p.variants.reduce((vs, v) => vs + parsePrice(v.price), 0) / p.variants.length, 0) / products.length) : 0;

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ringkasan katalog produk Toko Arkan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="📦" label="Total Produk" value={totalProducts} colorClass="bg-gradient-to-tr from-indigo-600 to-violet-500" />
        <StatCard icon="🏷️" label="Total Varian" value={totalVariants} colorClass="bg-gradient-to-tr from-emerald-600 to-teal-500" />
        <StatCard icon="📂" label="Kategori" value={categories.length} colorClass="bg-gradient-to-tr from-amber-500 to-orange-500" />
        <StatCard icon="💰" label="Rata-rata Harga" value={"Rp " + avgPrice.toLocaleString("id-ID")} colorClass="bg-gradient-to-tr from-rose-500 to-pink-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-900 dark:text-white">Produk Terbaru</h2>
          <Link to="/admin/products" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Lihat semua →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm">Belum ada produk</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products
              .slice(-5)
              .reverse()
              .map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <img
                    src={resolveImage(p.variants[0]?.image, 200)}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 rounded-xl object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                    onError={handleImageError}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.variants.length} varian • {p.category}
                    </p>
                  </div>
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-950 transition"
                  >
                    Edit
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
