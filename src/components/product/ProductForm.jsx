import React, { useState, useEffect } from "react";
import { LIST_KATEGORI } from "../../utils/constants";
import { formatRupiah, parseRupiahToNumber } from "../../utils/formatters";

const ProductForm = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [previewGambar, setPreviewGambar] = useState(null);
  const [fileGambar, setFileGambar] = useState(null);
  const [satuanUtamaInput, setSatuanUtamaInput] = useState("");
  const [hargaUtamaInput, setHargaUtamaInput] = useState("");
  const [pakaiMultiSatuan, setPakaiMultiSatuan] = useState(false);
  const [formVariasi, setFormVariasi] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      setNama(initialData.nama);
      setKategori(initialData.kategori);
      setPreviewGambar(initialData.gambarUrl);
      setSatuanUtamaInput(initialData.opsiVariasi[0]?.namaVariasi || "");
      setHargaUtamaInput("Rp " + (initialData.opsiVariasi[0]?.harga.toLocaleString("id-ID") || "0"));

      if (initialData.opsiVariasi.length > 1) {
        setPakaiMultiSatuan(true);
        setFormVariasi(
          initialData.opsiVariasi.slice(1).map((v) => ({
            namaVariasi: v.namaVariasi,
            hargaText: "Rp " + v.harga.toLocaleString("id-ID"),
          })),
        );
      } else {
        setPakaiMultiSatuan(false);
        setFormVariasi([]);
      }
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setNama("");
    setKategori("");
    setPreviewGambar(null);
    setFileGambar(null);
    setSatuanUtamaInput("");
    setHargaUtamaInput("");
    setPakaiMultiSatuan(false);
    setFormVariasi([]);
    setIsEditMode(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !hargaUtamaInput) return;

    const variasiSatu = {
      namaVariasi: satuanUtamaInput || (pakaiMultiSatuan ? "1 Pcs" : "Satuan"),
      harga: parseRupiahToNumber(hargaUtamaInput),
    };

    const variasiTambahan = formVariasi.map((v) => ({
      namaVariasi: v.namaVariasi || "Eceran",
      harga: parseRupiahToNumber(v.hargaText),
    }));

    const opsiVariasiBersih = [variasiSatu, ...variasiTambahan];

    onSubmit({
      nama,
      kategori: kategori || "Lainnya",
      gambar_url: previewGambar,
      opsi_variasi: opsiVariasiBersih,
      fileGambar,
      isEditMode,
      editId: initialData?.id,
      oldImageUrl: initialData?.gambarUrl,
    });
  };

  const handleGambarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileGambar(file);
      setPreviewGambar(URL.createObjectURL(file));
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          setFileGambar(blob);
          setPreviewGambar(URL.createObjectURL(blob));
          break;
        }
      }
    }
  };

  const tambahBarisVariasiForm = () => {
    setPakaiMultiSatuan(true);
    setFormVariasi([...formVariasi, { namaVariasi: "", hargaText: "" }]);
  };

  const hapusBarisVariasiForm = (index) => {
    const updated = formVariasi.filter((_, i) => i !== index);
    setFormVariasi(updated);
    if (updated.length === 0) {
      setPakaiMultiSatuan(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onPaste={handlePaste}>
      <div className="bg-[#1C2541] rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-6 relative border border-slate-800 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#0B1329] p-1.5 rounded-full">
          ✕
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-white">{isEditMode ? "Ubah Produk Warung" : "Tambah Produk Warung"}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Kelola katalog dagangan TOKO ARKAN secara presisi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Barang *</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-[#0B1329] border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: Terigu Segitiga"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full bg-[#0B1329] border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none"
            >
              <option value="">Pilih Kategori</option>
              {LIST_KATEGORI.slice(1).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Harga Satuan Utama *</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={satuanUtamaInput}
                onChange={(e) => setSatuanUtamaInput(e.target.value)}
                className="w-1/3 bg-[#0B1329] border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Misal: Bungkus / Kg"
                required
              />
              <input
                type="text"
                value={hargaUtamaInput}
                onChange={(e) => setHargaUtamaInput(formatRupiah(e.target.value))}
                className="w-2/3 bg-[#0B1329] border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Rp 0"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase">Eceran Satuan Lain (Opsional)</label>
              <button
                type="button"
                onClick={tambahBarisVariasiForm}
                className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-bold hover:bg-emerald-500 hover:text-[#0B1329] transition"
              >
                + Tambah Satuan
              </button>
            </div>

            {pakaiMultiSatuan &&
              formVariasi.map((variasi, index) => (
                <div key={index} className="flex items-center space-x-2 bg-[#0B1329] p-2 rounded-xl border border-slate-800 animate-fade-in">
                  <input
                    type="text"
                    value={variasi.namaVariasi}
                    onChange={(e) => {
                      const updated = [...formVariasi];
                      updated[index].namaVariasi = e.target.value;
                      setFormVariasi(updated);
                    }}
                    className="w-1/3 bg-[#1C2541] border border-slate-800 rounded-lg p-2 text-xs text-white text-center focus:outline-none"
                    placeholder="Misal: 1 Batang"
                    required
                  />
                  <input
                    type="text"
                    value={variasi.hargaText}
                    onChange={(e) => {
                      const updated = [...formVariasi];
                      updated[index].hargaText = formatRupiah(e.target.value);
                      setFormVariasi(updated);
                    }}
                    className="w-2/3 bg-[#1C2541] border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-bold focus:outline-none"
                    placeholder="Rp 0"
                    required
                  />
                  <button type="button" onClick={() => hapusBarisVariasiForm(index)} className="text-rose-500 hover:text-rose-400 text-xs px-1 font-bold">
                    ✕
                  </button>
                </div>
              ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Foto Produk</label>
            <div className="bg-[#0B1329] border-2 border-dashed border-slate-800 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500/40 relative">
              <input type="file" accept="image/*" onChange={handleGambarFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <p className="text-[11px] text-slate-400">
                Klik / <span className="text-emerald-400 font-bold">Tekan Ctrl + V</span> untuk paste gambar
              </p>
            </div>
            {previewGambar && (
              <div className="mt-3 relative w-20 h-20 border border-slate-800 rounded-xl overflow-hidden bg-[#0B1329] mx-auto">
                <img src={previewGambar} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewGambar(null);
                    setFileGambar(null);
                  }}
                  className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] p-1 rounded-bl-md"
                >
                  ✕
                </button>
              </div>
            )}
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
