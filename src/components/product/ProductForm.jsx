import React, { useState, useEffect, useRef } from "react";
import { LIST_KATEGORI } from "../../utils/constants";
import { formatRupiah, parseRupiahToNumber } from "../../utils/formatters";

const ProductForm = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [formVariasi, setFormVariasi] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pasteStatus, setPasteStatus] = useState("");
  const [showPasteUrl, setShowPasteUrl] = useState({});
  const [dragIndex, setDragIndex] = useState(null);

  const formRef = useRef(null);

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const updated = [...formVariasi];
    const [draggedItem] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, draggedItem);
    setFormVariasi(updated);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleDragLeave = () => {};

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      setNama(initialData.nama);
      setKategori(initialData.kategori);
      setFormVariasi(
        initialData.opsiVariasi.map((v, idx) => ({
          id: v.id || Date.now() + idx,
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
    setPasteStatus("");
    setShowPasteUrl({});
    setDragIndex(null);
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
    setPasteStatus("");
    setShowPasteUrl((prev) => ({ ...prev, [index]: false }));
  };

  const handlePasteUrl = (index, url) => {
    if (!url || url.trim() === "") {
      setPasteStatus("⚠️ Masukkan URL gambar terlebih dahulu");
      return;
    }

    const imageUrl = url.trim();
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
    const isValidImage =
      imageExtensions.some((ext) => imageUrl.toLowerCase().includes(ext)) || imageUrl.includes("images") || imageUrl.includes("img") || imageUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)/i);

    if (!isValidImage) {
      setPasteStatus("⚠️ URL bukan gambar yang valid. Pastikan URL berakhir dengan .jpg, .png, dll");
      return;
    }

    const updated = [...formVariasi];
    updated[index].gambarUrl = imageUrl;
    updated[index].gambarPreview = imageUrl;
    updated[index].gambarFile = null;
    setFormVariasi(updated);
    setPasteStatus(`✅ Gambar berhasil ditempel dari URL ke Tipe ${index + 1}`);
    setShowPasteUrl((prev) => ({ ...prev, [index]: false }));
  };

  const handleGlobalPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const emptyImageIndex = formVariasi.findIndex((v) => !v.gambarPreview);

        if (emptyImageIndex !== -1) {
          const blob = items[i].getAsFile();
          const previewUrl = URL.createObjectURL(blob);
          handleGambarChange(emptyImageIndex, blob, previewUrl);
          setPasteStatus(`✅ Gambar berhasil ditempel ke Tipe ${emptyImageIndex + 1}`);
        } else {
          setPasteStatus("⚠️ Semua tipe sudah punya gambar");
        }
        break;
      }
    }
  };

  const handleMobilePaste = async (index) => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        setShowPasteUrl((prev) => ({ ...prev, [index]: true }));
        setPasteStatus("📋 Browser tidak support paste gambar. Silakan paste URL gambar di bawah.");
        return;
      }

      const clipboardItems = await navigator.clipboard.read();

      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter((type) => type.startsWith("image/"));

        if (imageTypes.length > 0) {
          const blob = await clipboardItem.getType(imageTypes[0]);
          const file = new File([blob], `paste-${Date.now()}.png`, { type: blob.type });
          const previewUrl = URL.createObjectURL(blob);

          handleGambarChange(index, file, previewUrl);
          setPasteStatus(`✅ Gambar berhasil ditempel ke Tipe ${index + 1}`);
          return;
        }
      }

      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types.includes("text/plain")) {
          const text = await clipboardItem.getType("text/plain");
          const url = await text.text();

          if (url && (url.includes("http") || url.includes("https"))) {
            setShowPasteUrl((prev) => ({ ...prev, [index]: true }));
            setPasteStatus("📋 URL gambar terdeteksi. Masukkan ke kolom URL di bawah.");
            return;
          }
        }
      }

      setPasteStatus("❌ Tidak ada gambar atau URL di clipboard. Coba copy gambar terlebih dahulu.");
    } catch (error) {
      console.error("Paste error:", error);
      setShowPasteUrl((prev) => ({ ...prev, [index]: true }));
      setPasteStatus("📋 Gagal paste gambar. Silakan paste URL gambar di bawah.");
    }
  };

  const handleUrlInputChange = (index, value) => {};

  useEffect(() => {
    const formElement = formRef.current;
    if (formElement && isOpen) {
      formElement.addEventListener("paste", handleGlobalPaste);
      return () => {
        formElement.removeEventListener("paste", handleGlobalPaste);
      };
    }
  }, [isOpen, formVariasi]);

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
    setPasteStatus("");
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
    <div className="fixed inset-0 bg-[#0F0A1A]/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div ref={formRef} className="bg-[#1A1128] rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-6 relative [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TOMBOL X - TANPA BACKGROUND */}
        <button onClick={handleClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-full transition-colors text-sm font-bold">
          ✕
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-white">{isEditMode ? "Ubah Produk Warung" : "Tambah Produk Warung"}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Setiap tipe bisa punya gambar sendiri</p>
        </div>

        {pasteStatus && (
          <div
            className={`mb-3 p-2 rounded-xl text-xs font-bold ${
              pasteStatus.includes("✅") ? "bg-emerald-500/20 text-emerald-400" : pasteStatus.includes("⚠️") ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {pasteStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* NAMA BARANG */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Barang *</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-[#0F0A1A] rounded-xl p-2.5 text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
              placeholder="Contoh: Indomie"
              required
            />
          </div>

          {/* KATEGORI */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {LIST_KATEGORI.slice(1).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKategori(k)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    kategori === k ? "bg-amber-500 text-[#0F0A1A]" : "bg-[#0F0A1A] text-slate-400 hover:bg-[#1A1128] hover:text-white"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* TIPE / VARIASI */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">Tipe / Variasi *</label>
            </div>

            {formVariasi.map((variasi, index) => (
              <div
                key={variasi.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                className={`bg-[#0F0A1A] p-3 rounded-xl mb-3 transition-all shadow-sm ${dragIndex === index ? "opacity-50" : ""}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 cursor-grab text-sm select-none">☰</span>
                    <span className="text-[10px] text-slate-400">Tipe {index + 1}</span>
                  </div>
                  {formVariasi.length > 1 && (
                    <button type="button" onClick={() => hapusVariasi(index)} className="text-rose-500 text-xs hover:text-rose-400">
                      ✕ Hapus
                    </button>
                  )}
                </div>

                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={variasi.namaVariasi}
                    onChange={(e) => handleVariasiChange(index, "namaVariasi", e.target.value)}
                    className="flex-1 bg-[#1A1128] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    placeholder="Tipe (contoh: Pcs / Pack / Liter)"
                    required
                  />
                  <input
                    type="text"
                    value={variasi.hargaText}
                    onChange={(e) => handleVariasiChange(index, "hargaText", e.target.value)}
                    className="w-32 bg-[#1A1128] rounded-lg p-2 text-xs text-amber-400 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    placeholder="Rp 0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Gambar untuk tipe ini</label>

                  <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-[120px] bg-[#1A1128] rounded-xl p-2 text-center cursor-pointer hover:bg-[#1A1128]/80 relative">
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
                      <p className="text-[10px] text-slate-400">📷 Upload</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMobilePaste(index)}
                      className="px-3 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-[10px] font-bold hover:bg-amber-500 hover:text-[#0F0A1A] transition whitespace-nowrap"
                    >
                      📋 Paste
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasteUrl((prev) => ({ ...prev, [index]: !prev[index] }))}
                      className="px-3 py-2 bg-sky-500/10 text-sky-400 rounded-xl text-[10px] font-bold hover:bg-sky-500 hover:text-[#0F0A1A] transition whitespace-nowrap"
                    >
                      🔗 URL
                    </button>
                  </div>

                  {showPasteUrl[index] && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Tempel URL gambar di sini..."
                        className="flex-1 bg-[#1A1128] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                        onChange={(e) => handleUrlInputChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handlePasteUrl(index, e.target.value);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          handlePasteUrl(index, input.value);
                        }}
                        className="px-3 py-2 bg-amber-500 text-[#0F0A1A] rounded-lg text-[10px] font-bold hover:bg-amber-400 transition"
                      >
                        Tempel
                      </button>
                    </div>
                  )}

                  <p className="text-[9px] text-slate-500 mt-1 text-center">📱 HP: Copy gambar dari web, lalu klik "Paste" atau "URL" untuk tempel link</p>

                  {variasi.gambarPreview && (
                    <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden bg-[#0F0A1A] mx-auto shadow-sm">
                      <img src={variasi.gambarPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleGambarChange(index, null, null)} className="absolute top-0 right-0 bg-rose-600 text-white text-[8px] p-0.5 rounded-bl-md">
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={tambahVariasi} className="w-full mt-1 py-2.5 bg-amber-500/10 text-amber-400 rounded-xl font-bold text-xs hover:bg-amber-500 hover:text-[#0F0A1A] transition">
              + Tambah Tipe
            </button>
          </div>

          {/* TOMBOL SUBMIT */}
          <div className="flex justify-end space-x-2 pt-2 mt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-[#0F0A1A] text-slate-300 text-xs sm:text-sm font-semibold rounded-xl">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-amber-500 text-[#0F0A1A] text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:bg-amber-400 transition">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
