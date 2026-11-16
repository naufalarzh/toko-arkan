import React, { useState, useMemo, useRef, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConfirmDialog from "../components/admin/ConfirmDialog";
import { formatPrice } from "../utils/helpers";
import { useDebts } from "../context/DebtContext";

export default function HutangPage() {
  const { customers, loading, addDebt, payDebt, updateCustomerName, deleteCustomer, updateDebt } = useDebts();

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isEditDebtModalOpen, setIsEditDebtModalOpen] = useState(false);
  const [editDebtData, setEditDebtData] = useState({ id: null, amount: "", date: "", note: "" });

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const uniqueNames = useMemo(() => customers.map((c) => c.name), [customers]);

  const filteredNames = uniqueNames.filter((name) => name.toLowerCase().includes(formData.name.toLowerCase()) && name.toLowerCase() !== formData.name.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nameInputRef.current && !nameInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalBelumLunas = customers.reduce((total, c) => {
    return total + c.debts.filter((d) => d.status === "belum_lunas").reduce((sum, d) => sum + d.amount, 0);
  }, 0);

  const countBelumLunas = customers.reduce((count, c) => {
    return count + (c.debts.some((d) => d.status === "belum_lunas") ? 1 : 0);
  }, 0);

  const customerTotalBelum = selectedCustomer?.debts.filter((d) => d.status === "belum_lunas").reduce((sum, d) => sum + d.amount, 0) || 0;

  const sortedAndFilteredCustomers = useMemo(() => {
    return [...customers].filter((c) => c.name.toLowerCase().includes(searchCustomer.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchCustomer]);

  const handleAddDebt = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.amount) return;

    const amount = parseInt(formData.amount.replace(/[^0-9]/g, ""), 10);

    try {
      await addDebt(formData.name, {
        amount,
        date: formData.date,
        note: formData.note,
      });

      setFormData({ name: "", amount: "", note: "", date: new Date().toISOString().split("T")[0] });
      setIsFormOpen(false);
    } catch (error) {
      alert("Gagal menambah hutang: " + error.message);
    }
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, amount: raw ? parseInt(raw, 10).toLocaleString("id-ID") : "" });
  };

  const handlePayAll = async () => {
    try {
      await payDebt(selectedCustomerId, customerTotalBelum, selectedCustomer.debts);
      setIsPayModalOpen(false);
      setPayAmount("");
    } catch (error) {
      alert("Gagal melakukan pembayaran: " + error.message);
    }
  };

  const handlePayPartial = async (e) => {
    e.preventDefault();
    const numericAmount = parseInt(payAmount.replace(/[^0-9]/g, ""), 10);
    if (!numericAmount || numericAmount <= 0) return;

    try {
      if (numericAmount >= customerTotalBelum) {
        await payDebt(selectedCustomerId, customerTotalBelum, selectedCustomer.debts);
      } else {
        await payDebt(selectedCustomerId, numericAmount, selectedCustomer.debts);
      }
      setIsPayModalOpen(false);
      setPayAmount("");
    } catch (error) {
      alert("Gagal melakukan pembayaran: " + error.message);
    }
  };

  const handlePayAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setPayAmount(raw ? parseInt(raw, 10).toLocaleString("id-ID") : "");
  };

  const handleEditNameSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await updateCustomerName(selectedCustomerId, editName);
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Gagal mengubah nama: " + error.message);
    }
  };

  const handleDeleteCustomer = () => setIsDeleteModalOpen(true);

  const executeDeleteCustomer = async () => {
    try {
      await deleteCustomer(selectedCustomerId);
      setIsDeleteModalOpen(false);
      setSelectedCustomerId(null);
    } catch (error) {
      alert("Gagal menghapus pelanggan: " + error.message);
    }
  };

  const openEditDebtModal = (debt) => {
    setEditDebtData({
      id: debt.id,
      amount: debt.amount.toLocaleString("id-ID"),
      date: debt.date,
      note: debt.note || "",
    });
    setIsEditDebtModalOpen(true);
  };

  const handleEditDebtSubmit = async (e) => {
    e.preventDefault();
    try {
      const numericAmount = parseInt(editDebtData.amount.replace(/[^0-9]/g, ""), 10);
      await updateDebt(editDebtData.id, {
        amount: numericAmount,
        date: editDebtData.date,
        note: editDebtData.note,
      });
      setIsEditDebtModalOpen(false);
    } catch (error) {
      alert("Gagal mengubah rincian hutang: " + error.message);
    }
  };

  const handleEditDebtAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setEditDebtData({ ...editDebtData, amount: raw ? parseInt(raw, 10).toLocaleString("id-ID") : "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 font-semibold animate-pulse text-lg">Memuat data hutang...</div>
      </div>
    );
  }

  // ==========================================
  // RENDER: DETAIL PELANGGAN
  // ==========================================
  if (selectedCustomerId && selectedCustomer) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans relative">
        <Header searchQuery="" setSearchQuery={() => {}} totalItems={0} onOpenCart={() => {}} />

        <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <button onClick={() => setSelectedCustomerId(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition mb-6">
          Kembali ke Daftar Pelanggan
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold uppercase flex-shrink-0">{selectedCustomer.name.charAt(0)}</div>
              <div>
                <h1 className="text-3xl font-extrabold">{selectedCustomer.name}</h1>
                <p className="text-sm text-slate-500">Total {selectedCustomer.debts.length} transaksi tercatat</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => {
                  setEditName(selectedCustomer.name);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition shadow-sm"
              >
                Update
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/60 transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-xl p-6 sm:p-8 text-white mb-8 shadow-lg shadow-rose-500/20">
            <p className="text-sm font-semibold text-rose-100 uppercase tracking-wider mb-1">Total Hutang Tersisa</p>
            <p className="text-3xl sm:text-4xl font-extrabold">{formatPrice(customerTotalBelum)}</p>
            {customerTotalBelum === 0 && <p className="text-sm font-bold text-white mt-2 bg-white/20 inline-block px-3 py-1 rounded-lg">✅ Semua Hutang Telah Lunas</p>}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold">Rincian Hutang</h3>

              {customerTotalBelum > 0 && (
                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 text-xs sm:text-sm rounded-lg shadow-md transition active:scale-95 whitespace-nowrap"
                >
                Bayar Hutang
                </button>
              )}
            </div>

            {selectedCustomer.debts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-sm font-semibold">Tidak ada catatan hutang berjalan.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedCustomer.debts.map((debt) => (
                  <div key={debt.id} className="p-4 sm:p-5 flex flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditDebtModal(debt)}
                        className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-950 transition"
                      >
                        Edit
                      </button>

                      <div className="min-w-0">
                        <p className="font-bold text-sm sm:text-base truncate">{debt.note || "Tanpa keterangan"}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500">Tanggal: {debt.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-extrabold text-sm sm:text-base ${debt.status === "lunas" ? "text-slate-400 line-through" : "text-rose-600"}`}>{formatPrice(debt.amount)}</p>
                      <span className={`hidden sm:block text-[10px] font-bold uppercase mt-0.5 ${debt.status === "lunas" ? "text-emerald-500" : "text-rose-500"}`}>
                        {debt.status === "lunas" ? "Lunas" : "Belum Lunas"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />

        {/* MODAL EDIT NAMA PELANGGAN */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Ubah Nama Pelanggan</h3>
              <form onSubmit={handleEditNameSubmit}>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-lg">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDIT RINCIAN HUTANG */}
        {isEditDebtModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsEditDebtModalOpen(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Edit Rincian Hutang</h3>
              <form onSubmit={handleEditDebtSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nominal Hutang</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-bold">Rp</span>
                    <input
                      type="text"
                      required
                      value={editDebtData.amount}
                      onChange={handleEditDebtAmountChange}
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal Hutang</label>
                  <input
                    type="date"
                    required
                    value={editDebtData.date}
                    onChange={(e) => setEditDebtData({ ...editDebtData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:opacity-50 dark:[&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Keterangan</label>
                  <input
                    type="text"
                    value={editDebtData.note}
                    onChange={(e) => setEditDebtData({ ...editDebtData, note: e.target.value })}
                    placeholder="Contoh: Beras 5kg"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditDebtModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-lg">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PEMBAYARAN */}
        {isPayModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsPayModalOpen(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">💵</div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">Pembayaran Hutang</h3>
                <p className="text-sm text-slate-500">
                  Sisa hutang: <span className="font-bold text-rose-500">{formatPrice(customerTotalBelum)}</span>
                </p>
              </div>

              <button onClick={handlePayAll} className="w-full mb-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-lg">
                Bayar Semua (Lunas)
              </button>

              <div className="relative flex py-2 items-center mb-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold">ATAU BAYAR SEBAGIAN</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <form onSubmit={handlePayPartial}>
                <div className="relative mb-4">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-bold">Rp</span>
                  <input
                    type="text"
                    value={payAmount}
                    onChange={handlePayAmountChange}
                    placeholder="Masukkan nominal..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!payAmount}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proses Pembayaran
                </button>
              </form>

              <button onClick={() => setIsPayModalOpen(false)} className="w-full mt-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition">
                Batal
              </button>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={isDeleteModalOpen}
          title="Hapus Pelanggan?"
          message={`Pelanggan "${selectedCustomer.name}" beserta seluruh catatan hutangnya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Ya, Hapus"
          cancelLabel="Batal"
          onConfirm={executeDeleteCustomer}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      </div>
    );
  }

  // ==========================================
  // RENDER: LIST UTAMA & FORM
  // ==========================================
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans relative">
      <Header searchQuery="" setSearchQuery={() => {}} totalItems={0} onOpenCart={() => {}} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Catatan Hutang</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pilih nama pelanggan untuk melihat rincian hutang.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-5 py-3 rounded-lg shadow-lg transition"
          >
            <span>Tambah Hutang</span>
          </button>
        </div>

        {/* KOTAK MERAH TOTAL HUTANG */}
        <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-xl p-6 sm:p-8 text-white mb-8 shadow-lg">
          <p className="text-sm font-semibold text-rose-100 uppercase">Total Seluruh Hutang Belum Lunas</p>
          <p className="text-3xl sm:text-4xl font-extrabold mb-2">{formatPrice(totalBelumLunas)}</p>
          <p className="text-sm text-rose-100">Dari {countBelumLunas} pelanggan</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold">Daftar Pelanggan</h3>

            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 pl-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="Cari nama pelanggan..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {sortedAndFilteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm font-semibold">Pelanggan tidak ditemukan.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedAndFilteredCustomers.map((customer) => {
                const totalHutang = customer.debts.filter((d) => d.status === "belum_lunas").reduce((sum, d) => sum + d.amount, 0);
                const isLunas = totalHutang === 0;

                return (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isLunas ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-base group-hover:text-indigo-600 transition">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.debts.length} transaksi</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className={`font-extrabold ${isLunas ? "text-emerald-500" : "text-rose-600"}`}>{isLunas ? "Lunas" : formatPrice(totalHutang)}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{isLunas ? "Selesai" : "Belum Lunas"}</p>
                      </div>
                      <span className="text-slate-300 group-hover:text-indigo-500 transition"></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* MODAL TAMBAH HUTANG BARU */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg">Tambah Catatan Baru</h3>
              <button onClick={() => setIsFormOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <form id="form-tambah-hutang" onSubmit={handleAddDebt} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative" ref={nameInputRef}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Pelanggan *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Ketik nama (atau pilih)..."
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />

                    {showSuggestions && filteredNames.length > 0 && (
                      <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {filteredNames.map((name) => (
                          <li key={name}>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, name });
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                            >
                              {name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nominal Hutang *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-bold">Rp</span>
                      <input
                        type="text"
                        required
                        value={formData.amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal Hutang *</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none [&::-webkit-calendar-picker-indicator]:opacity-50 dark:[&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Keterangan (Opsional)</label>
                    <input
                      type="text"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Contoh: Beras 5kg"
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button type="submit" form="form-tambah-hutang" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg transition shadow-lg w-full sm:w-auto">
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
