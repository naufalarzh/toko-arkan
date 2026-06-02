import React, { useState, useEffect } from "react";
import { LIST_KATEGORI } from "../../utils/constants";
import { formatRupiah, parseRupiahToNumber } from "../../utils/formatters";

const ProductForm = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [formVariasi, setFormVariasi] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      setNama(initialData.nama);
      setKategori(initialData.kategori);
      setFormVariasi(
        initialData.opsiVariasi.map((v, idx) => ({
          id: idx,
          namaVariasi: v.namaVariasi,
          harga: v.harga,
          hargaText: "Rp " + v.harga.toLocaleString("id-ID"),
          gambarPreview: v.gambarUrl || null,
          gambarFile: null,
          gambarUrl: v.gambarUrl || null,
        })),
      );
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setNama("");
    setKategori("");
    setFormVariasi([
      {
        id: Date.now(),
        namaVariasi: "",
        harga: 0,
        hargaText: "",
        gambarPreview: null,
        gambarFile: null,
        gambarUrl: null,
      },
    ]);
    setIsEditMode(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleVariasiChange = (index, field, value) => {
    const updated = [...formVariasi];
    if (field === "hargaText") {
      const formatted = formatRupiah(value);
      updated[index].hargaText = formatted;
      updated[index].harga = parseRupiahToNumber(formatted);
    } else if (field === "namaVariasi") {
      updated[index].namaVariasi = value;
    }
    setFormVariasi(updated);
  };

  const handleGambarChange = (index, file, previewUrl) => {
    const updated = [...formVariasi];
    updated[index].gambarFile = file;
    updated[index].gambarPreview = previewUrl;
    updated[index].gambarUrl = previewUrl;
    setFormVariasi(updated);
  };

  const handlePaste = (index, e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          const previewUrl = URL.createObjectURL(blob);
          handleGambarChange(index, blob, previewUrl);
          break;
        }
      }
    }
  };

  const tambahVariasi = () => {
    setFormVariasi([
      ...formVariasi,
      {
        id: Date.now(),
        namaVariasi: "",
        harga: 0,
        hargaText: "",
        gambarPreview: null,
        gambarFile: null,
        gambarUrl: null,
      },
    ]);
  };

  const hapusVariasi = (index) => {
    if (formVariasi.length <= 1) return;
    const updated = formVariasi.filter((_, i) => i !== index);
    setFormVariasi(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || formVariasi.some((v) => !v.namaVariasi || !v.harga)) return;

    const opsiVariasi = formVariasi.map((v) => ({
      namaVariasi: v.namaVariasi,
      harga: v.harga,
      gambarUrl: v.gambarUrl,
      gambarFile: v.gambarFile,
    }));

    onSubmit({
      nama,
      kategori: kategori || "Lainnya",
      opsi_variasi: opsiVariasi,
      isEditMode,
      editId: initialData?.id,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-[#1C2541] rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-6 relative border border-slate-800 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#0B1329] p-1.5 rounded-full">
          ✕
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-white">{isEditMode ? "Ubah Produk Warung" : "Tambah Produk Warung"}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Setiap tipe bisa punya gambar sendiri</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Barang *</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-[#0B1329] border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: Djarum Coklat"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {LIST_KATEGORI.slice(1).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKategori(k)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    kategori === k ? "bg-emerald-500 text-[#0B1329] border-emerald-500" : "bg-[#0B1329] text-slate-400 border-slate-800 hover:border-emerald-500/50"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">Tipe / Variasi *</label>
              <button
                type="button"
                onClick={tambahVariasi}
                className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-bold hover:bg-emerald-500 hover:text-[#0B1329] transition"
              >
                + Tambah Tipe
              </button>
            </div>

            {formVariasi.map((variasi, index) => (
              <div key={variasi.id} className="bg-[#0B1329] p-3 rounded-xl border border-slate-800 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400">Tipe {index + 1}</span>
                  {formVariasi.length > 1 && (
                    <button type="button" onClick={() => hapusVariasi(index)} className="text-rose-500 text-xs">
                      ✕ Hapus
                    </button>
                  )}
                </div>

                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={variasi.namaVariasi}
                    onChange={(e) => handleVariasiChange(index, "namaVariasi", e.target.value)}
                    className="flex-1 bg-[#1C2541] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Tipe (contoh: Kretek / Extra / Mocca)"
                    required
                  />
                  <input
                    type="text"
                    value={variasi.hargaText}
                    onChange={(e) => handleVariasiChange(index, "hargaText", e.target.value)}
                    className="w-32 bg-[#1C2541] border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Rp 0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Gambar untuk tipe ini</label>
                  <div
                    className="bg-[#1C2541] border-2 border-dashed border-slate-800 rounded-xl p-2 text-center cursor-pointer hover:border-emerald-500/40 relative"
                    onPaste={(e) => handlePaste(index, e)}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          handleGambarChange(index, file, previewUrl);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">
                      📷 Klik / <span className="text-emerald-400 font-bold">Ctrl+V</span> paste
                    </p>
                  </div>
                  {variasi.gambarPreview && (
                    <div className="mt-2 relative w-16 h-16 border border-slate-800 rounded-lg overflow-hidden bg-[#0B1329] mx-auto">
                      <img src={variasi.gambarPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleGambarChange(index, null, null)} className="absolute top-0 right-0 bg-rose-600 text-white text-[8px] p-0.5 rounded-bl-md">
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800 mt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-[#0B1329] text-slate-300 text-xs sm:text-sm font-semibold rounded-xl">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-emerald-500 text-[#0B1329] text-xs sm:text-sm font-bold rounded-xl shadow-lg">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
