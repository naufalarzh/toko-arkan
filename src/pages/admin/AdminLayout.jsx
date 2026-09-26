import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoArkan from "../../../public/Logo.png";

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/products", label: "Produk", icon: "📦" },
  { to: "/admin/products/new", label: "Tambah Produk", icon: "➕" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tampilkan email sebagai username
  const username = user?.email || "Admin";

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950">
      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-slate-100 flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 flex-shrink-0 p-1">
              <img src={logoArkan} alt="Toko Arkan" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-white">Toko Arkan</h1>
              <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center" aria-label="Tutup menu">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition mt-4 border-t border-slate-800 pt-4"
          >
            <span className="text-base">🛍️</span>
            Lihat Toko
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Login sebagai</p>
            <p className="text-sm font-bold text-white truncate">{username}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 lg:ml-64 min-h-screen w-full">
        <div className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-lg"
            aria-label="Buka menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img src={logoArkan} alt="Toko Arkan" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">Admin Panel</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
