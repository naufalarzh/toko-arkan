import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoArkan from "../../../public/Logo.png";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setError(err.message === "Invalid login credentials" ? "Email atau password salah" : err.message || "Gagal login. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background gradient tetap dibiarkan sesuai permintaan
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* EFEK PADA ICON DIHILANGKAN: 
              Menghapus bg-gradient-to-tr from-indigo-600 to-violet-500
              Menghapus shadow-xl shadow-indigo-500/30
              Diganti dengan bg-slate-800 / border solid agar tetap rapi */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 border border-slate-700 rounded-xl mb-4 overflow-hidden p-3">
            <img src={logoArkan} alt="Toko Arkan" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Admin Panel</h1>
          <p className="text-sm text-slate-400">Toko Arkan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Masuk ke Dashboard</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>

          {/* EFEK PADA BUTTON DIHILANGKAN: 
              Menghapus shadow-lg shadow-indigo-500/30
              Menghapus efek transition */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3.5 rounded-lg ${loading ? "bg-slate-400 dark:bg-slate-700 text-white cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
          >
            {loading ? "⏳ Memproses..." : "Masuk"}
          </button>

          <Link to="/" className="mt-4 block text-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            ← Kembali ke Toko
          </Link>
        </form>
      </div>
    </div>
  );
}
