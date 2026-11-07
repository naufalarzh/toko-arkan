import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProductProvider } from "./context/ProductContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DebtProvider } from "./context/DebtContext";

// Halaman Public
import UserPage from "./pages/UserPage";
import ProtectedHutang from "./pages/ProtectedHutang"; // <-- Import halaman yang diproteksi password

// Halaman Admin
import LoginAdmin from "./pages/admin/LoginAdmin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductList from "./pages/admin/ProductList";
import ProductForm from "./pages/admin/ProductForm";

// Proteksi Rute Admin (Wajib Login)
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-slate-500 dark:text-slate-400 font-semibold">Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

// Redirect jika sudah login tapi malah buka halaman login
function RedirectIfAuthed({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <DebtProvider>
          <BrowserRouter>
            <Routes>
              {/* ========================================= */}
              {/* RUTE PUBLIC                               */}
              {/* ========================================= */}
              <Route path="/" element={<UserPage />} />

              {/* Rute Hutang yang diamankan dengan Password */}
              <Route path="/hutang" element={<ProtectedHutang />} />

              {/* ========================================= */}
              {/* RUTE ADMIN                                */}
              {/* ========================================= */}
              <Route
                path="/admin/login"
                element={
                  <RedirectIfAuthed>
                    <LoginAdmin />
                  </RedirectIfAuthed>
                }
              />

              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
              </Route>

              {/* ========================================= */}
              {/* FALLBACK                                  */}
              {/* ========================================= */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DebtProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
