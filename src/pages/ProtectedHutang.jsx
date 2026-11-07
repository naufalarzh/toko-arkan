import React, { useState } from "react";
import HutangPage from "./HutangPage";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ProtectedHutang() {
  // Cek session storage, jika belum ada berarti belum login
  const [isAuthorized, setIsAuthorized] = useState(sessionStorage.getItem("hutang_access") === "true");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // PASSWORD ANDA BISA DIGANTI DI SINI
  const SECRET_PASSWORD = "popokucing";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      sessionStorage.setItem("hutang_access", "true");
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Password salah! Akses ditolak.");
      setPassword("");
    }
  };

  // Jika belum login, tampilkan form password
  if (!isAuthorized) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans">
        {/* Tetap tampilkan Header agar navigasi tidak hilang */}
        <Header searchQuery="" setSearchQuery={() => {}} totalItems={0} onOpenCart={() => {}} />

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl animate-fade-in text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-inner">🔒</div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Akses Terbatas</h2>
            <p className="text-sm text-slate-500 mb-6">Halaman Catatan Hutang bersifat privat. Silakan masukkan password untuk melanjutkan.</p>

            {error && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password..."
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-bold tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 transition"
                autoFocus
              />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-500/30 active:scale-95">
                Buka Halaman
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Jika password benar, tampilkan halaman aslinya
  return <HutangPage />;
}
