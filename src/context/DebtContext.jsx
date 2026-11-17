import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const DebtContext = createContext();

export function DebtProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 1. FETCH DATA DARI SUPABASE
  // ==========================================
  const fetchDebts = useCallback(async () => {
    setLoading(true);
    // Ambil data pelanggan beserta relasi hutangnya
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        id, 
        name, 
        debts (
          id, amount, date, note, status
        )
      `,
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Gagal fetch data hutang:", error);
      setCustomers([]);
    } else {
      // Urutkan hutang berdasarkan tanggal (terlama ke terbaru) di dalam tiap pelanggan
      const formattedData = data.map((c) => ({
        ...c,
        debts: (c.debts || []).sort((a, b) => new Date(a.date) - new Date(b.date)),
      }));
      setCustomers(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  // ==========================================
  // 2. TAMBAH HUTANG BARU
  // ==========================================
  const addDebt = async (customerName, debtData) => {
    // Cek apakah pelanggan sudah ada
    const { data: existingCustomer, error: errCheck } = await supabase
      .from("customers")
      .select("id")
      .ilike("name", customerName.trim()) // ilike = case-insensitive
      .maybeSingle();

    if (errCheck) throw errCheck;

    let customerId = existingCustomer?.id;

    // Jika belum ada, buat pelanggan baru
    if (!customerId) {
      const { data: newCustomer, error: errCust } = await supabase.from("customers").insert({ name: customerName.trim() }).select().single();

      if (errCust) throw errCust;
      customerId = newCustomer.id;
    }

    // Insert data hutang
    const { error: errDebt } = await supabase.from("debts").insert({
      customer_id: customerId,
      amount: debtData.amount,
      date: debtData.date,
      note: debtData.note,
      status: "belum_lunas",
    });

    if (errDebt) throw errDebt;
    await fetchDebts();
  };

  // ==========================================
  // 3. PROSES PEMBAYARAN HUTANG
  // ==========================================
  const payDebt = async (customerId, amountToPay, currentDebts) => {
    // Hitung total sisa hutang saat ini
    const totalSisa = currentDebts.filter((d) => d.status === "belum_lunas").reduce((sum, d) => sum + d.amount, 0);

    const sisaSetelahBayar = totalSisa - amountToPay;

    // Hapus semua riwayat hutang pelanggan ini
    const { error: errDelete } = await supabase.from("debts").delete().eq("customer_id", customerId);

    if (errDelete) throw errDelete;

    // Jika masih ada sisa hutang, buat 1 baris baru untuk sisa tersebut
    if (sisaSetelahBayar > 0) {
      const { error: errInsert } = await supabase.from("debts").insert({
        customer_id: customerId,
        amount: sisaSetelahBayar,
        date: new Date().toISOString().split("T")[0],
        note: "Sisa Hutang",
        status: "belum_lunas",
      });
      if (errInsert) throw errInsert;
    }

    await fetchDebts();
  };

  // ==========================================
  // 4. EDIT NAMA PELANGGAN
  // ==========================================
  const updateCustomerName = async (customerId, newName) => {
    const { error } = await supabase.from("customers").update({ name: newName.trim() }).eq("id", customerId);

    if (error) throw error;
    await fetchDebts();
  };

  // ==========================================
  // 5. EDIT RINCIAN HUTANG
  // ==========================================
  const updateDebt = async (debtId, updatedData) => {
    const { error } = await supabase
      .from("debts")
      .update({
        amount: updatedData.amount,
        date: updatedData.date,
        note: updatedData.note,
      })
      .eq("id", debtId);

    if (error) throw error;
    await fetchDebts();
  };

  // ==========================================
  // 6. HAPUS PELANGGAN
  // ==========================================
  const deleteCustomer = async (customerId) => {
    // Karena di database kita menggunakan ON DELETE CASCADE,
    // menghapus customer otomatis akan menghapus semua hutangnya.
    const { error } = await supabase.from("customers").delete().eq("id", customerId);

    if (error) throw error;
    await fetchDebts();
  };

  // ==========================================
  // EXPORT VALUE KE APLIKASI
  // ==========================================
  const value = {
    customers,
    loading,
    addDebt,
    payDebt,
    updateCustomerName,
    updateDebt, // <-- Fungsi baru untuk edit rincian hutang
    deleteCustomer,
    refetch: fetchDebts,
  };

  return <DebtContext.Provider value={value}>{children}</DebtContext.Provider>;
}

// ==========================================
// CUSTOM HOOK
// ==========================================
export function useDebts() {
  const ctx = useContext(DebtContext);
  if (!ctx) throw new Error("useDebts harus dipakai di dalam DebtProvider");
  return ctx;
}
