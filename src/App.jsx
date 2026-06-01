import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

function App() {
  // State Kontrol UI
  const [isOpen, setIsOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State Pencarian
  const [searchQuery, setSearchQuery] = useState("");

  // State Variasi aktif per produk
  const [variasiTerpilih, setVariasiTerpilih] = useState({});

  const menuRef = useRef({});

  // State Daftar Barang dari Supabase
  const [daftarBarang, setDaftarBarang] = useState([]);

  // State Keranjang (tetap di localStorage)
  const [keranjang, setKeranjang] = useState({});

  // State Form Input
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [previewGambar, setPreviewGambar] = useState(null);
  const [fileGambar, setFileGambar] = useState(null);
  const [existingGambarUrl, setExistingGambarUrl] = useState("");

  // State Form Variasi Harga
  const [satuanUtamaInput, setSatuanUtamaInput] = useState("");
  const [hargaUtamaInput, setHargaUtamaInput] = useState("");
  const [pakaiMultiSatuan, setPakaiMultiSatuan] = useState(false);
  const [formVariasi, setFormVariasi] = useState([]);

  // State Modal Hapus
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [barangIdMauDihapus, setBarangIdMauDihapus] = useState(null);
  const [namaBarangMauDihapus, setNamaBarangMauDihapus] = useState("");

  const listKategori = ["Semua", "Sembako", "Makanan", "Minuman", "Rokok", "Alat Tulis", "Listrik", "Lainnya"];

  // --- AMBIL DATA DARI SUPABASE (REALTIME) ---
  useEffect(() => {
    fetchData();

    // Subscribe ke perubahan realtime
    const subscription = supabase
      .channel("public:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        console.log("Realtime update:", payload);
        fetchData(); // Refresh data
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

      if (error) throw error;

      // Convert data ke format yang sama seperti sebelumnya
      const formattedData = data.map((item) => ({
        id: item.id,
        nama: item.nama,
        kategori: item.kategori,
        gambarUrl: item.gambar_url,
        opsiVariasi: item.opsi_variasi,
      }));

      setDaftarBarang(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setToastMessage("❌ Gagal mengambil data dari database!");
    }
  };

  // Load keranjang dari localStorage
  useEffect(() => {
    const storedKeranjang = localStorage.getItem("keranjang");
    if (storedKeranjang) {
      setKeranjang(JSON.parse(storedKeranjang));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
  }, [keranjang]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (activeMenuId !== null) {
        const currentMenuRef = menuRef.current[activeMenuId];
        if (currentMenuRef && !currentMenuRef.contains(event.target)) {
          setActiveMenuId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeMenuId]);

  // Format Rupiah
  const formatRupiah = (value) => {
    if (!value) return "";
    const number = value.replace(/\D/g, "");
    if (number === "") return "";
    return "Rp " + Number(number).toLocaleString("id-ID");
  };

  const handleHargaUtamaChange = (e) => {
    setHargaUtamaInput(formatRupiah(e.target.value));
  };

  const handleFormHargaChange = (index, valueText) => {
    const updatedVariasi = [...formVariasi];
    updatedVariasi[index].hargaText = formatRupiah(valueText);
    setFormVariasi(updatedVariasi);
  };

  const handleFormLabelChange = (index, valueLabel) => {
    const updatedVariasi = [...formVariasi];
    updatedVariasi[index].namaVariasi = valueLabel;
    setFormVariasi(updatedVariasi);
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

  // Paste foto dari clipboard
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isOpen) return;
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
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  const handleGambarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileGambar(file);
      setPreviewGambar(URL.createObjectURL(file));
    }
  };

  // Upload gambar ke Supabase Storage
  const uploadGambarKeStorage = async (file, oldImageUrl = null) => {
    if (!file) return null;

    // Hapus gambar lama jika ada
    if (oldImageUrl && oldImageUrl.includes("supabase.co")) {
      const oldPath = oldImageUrl.split("/").pop();
      await supabase.storage.from("produk-images").remove([oldPath]);
    }

    // Buat nama file unik
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage.from("produk-images").upload(fileName, file);

    if (uploadError) throw uploadError;

    // Dapatkan URL publik
    const {
      data: { publicUrl },
    } = supabase.storage.from("produk-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const tambahKuantitas = (barangId, namaVariasi) => {
    const keyKeranjang = `${barangId}-${namaVariasi}`;
    setKeranjang((prev) => ({ ...prev, [keyKeranjang]: (prev[keyKeranjang] || 0) + 1 }));
  };

  const kurangKuantitas = (keyKeranjang) => {
    setKeranjang((prev) => {
      const current = prev[keyKeranjang] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[keyKeranjang];
        return copy;
      }
      return { ...prev, [keyKeranjang]: current - 1 };
    });
  };

  const handleClearKeranjang = () => {
    setKeranjang({});
    setShowDetail(false);
    setToastMessage("Keranjang belanja dikosongkan");
  };

  // Edit data
  const handleEditClick = (barang) => {
    setIsEditMode(true);
    setEditId(barang.id);
    setNama(barang.nama);
    setKategori(barang.kategori);
    setPreviewGambar(barang.gambarUrl);
    setExistingGambarUrl(barang.gambarUrl);

    setSatuanUtamaInput(barang.opsiVariasi[0].namaVariasi);
    setHargaUtamaInput("Rp " + barang.opsiVariasi[0].harga.toLocaleString("id-ID"));

    if (barang.opsiVariasi.length > 1) {
      setPakaiMultiSatuan(true);
      const sisaVariasi = barang.opsiVariasi.slice(1).map((v) => ({
        namaVariasi: v.namaVariasi,
        hargaText: "Rp " + v.harga.toLocaleString("id-ID"),
      }));
      setFormVariasi(sisaVariasi);
    } else {
      setPakaiMultiSatuan(false);
      setFormVariasi([]);
    }

    setIsOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (id) => {
    const barang = daftarBarang.find((b) => b.id === id);
    if (barang) {
      setBarangIdMauDihapus(id);
      setNamaBarangMauDihapus(barang.nama);
      setIsConfirmOpen(true);
    }
    setActiveMenuId(null);
  };

  // Hapus produk dari Supabase
  const eksekusiHapusBarang = async () => {
    if (!barangIdMauDihapus) return;

    setIsLoading(true);
    try {
      // Cari barang untuk hapus gambar
      const barang = daftarBarang.find((b) => b.id === barangIdMauDihapus);

      if (barang && barang.gambarUrl && barang.gambarUrl.includes("supabase.co")) {
        const fileName = barang.gambarUrl.split("/").pop();
        await supabase.storage.from("produk-images").remove([fileName]);
      }

      // Hapus dari database
      const { error } = await supabase.from("products").delete().eq("id", barangIdMauDihapus);

      if (error) throw error;

      setToastMessage("✨ Produk berhasil dihapus!");
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Gagal menghapus:", error);
      setToastMessage("❌ Gagal menghapus produk!");
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
      setBarangIdMauDihapus(null);
      setNamaBarangMauDihapus("");
    }
  };

  const hitungTotalBelanja = () => {
    let totalHarga = 0;
    let totalItem = 0;
    const detailProdukTerpilih = [];

    Object.keys(keranjang).forEach((keyKeranjang) => {
      const [barangId, namaVariasi] = keyKeranjang.split("-");
      const barang = daftarBarang.find((b) => b.id === barangId);

      if (barang) {
        const variasi = barang.opsiVariasi.find((v) => v.namaVariasi === namaVariasi);
        if (variasi) {
          const subTotal = variasi.harga * keranjang[keyKeranjang];
          totalHarga += subTotal;
          totalItem += keranjang[keyKeranjang];
          detailProdukTerpilih.push({
            keyKeranjang,
            nama: `${barang.nama} (${variasi.namaVariasi})`,
            harga: variasi.harga,
            jumlah: keranjang[keyKeranjang],
            subTotal,
          });
        }
      }
    });
    return { totalHarga, totalItem, detailProdukTerpilih };
  };

  const { totalHarga, totalItem, detailProdukTerpilih } = hitungTotalBelanja();

  // Submit produk baru/update ke Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !hargaUtamaInput) return;

    setIsLoading(true);

    const variasiSatu = {
      namaVariasi: satuanUtamaInput || (pakaiMultiSatuan ? "1 Pcs" : "Satuan"),
      harga: Number(hargaUtamaInput.replace(/\D/g, "")) || 0,
    };

    const variasiTambahan = formVariasi.map((v) => ({
      namaVariasi: v.namaVariasi || "Eceran",
      harga: Number(v.hargaText.replace(/\D/g, "")) || 0,
    }));

    const opsiVariasiBersih = [variasiSatu, ...variasiTambahan];

    try {
      let urlGambarFinal = previewGambar;

      if (fileGambar) {
        setToastMessage("⏳ Mengunggah gambar...");
        const oldImageUrl = isEditMode ? existingGambarUrl : null;
        urlGambarFinal = await uploadGambarKeStorage(fileGambar, oldImageUrl);
      }

      const dataProduk = {
        nama,
        kategori: kategori || "Lainnya",
        gambar_url: urlGambarFinal || "https://placehold.co/400x400/1C2541/FFFFFF?text=No+Image",
        opsi_variasi: opsiVariasiBersih,
      };

      if (isEditMode) {
        // Update
        const { error } = await supabase.from("products").update(dataProduk).eq("id", editId);

        if (error) throw error;
        setToastMessage("✨ Produk diperbarui!");
      } else {
        // Insert baru
        const { error } = await supabase.from("products").insert([dataProduk]);

        if (error) throw error;
        setToastMessage("✨ Produk baru ditambahkan!");
      }

      await fetchData(); // Refresh
      closeFormModal();
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      setToastMessage("❌ Terjadi kesalahan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeFormModal = () => {
    setNama("");
    setKategori("");
    setPreviewGambar(null);
    setFileGambar(null);
    setExistingGambarUrl("");
    setSatuanUtamaInput("");
    setHargaUtamaInput("");
    setPakaiMultiSatuan(false);
    setFormVariasi([]);
    setIsEditMode(false);
    setEditId(null);
    setIsOpen(false);
  };

  const toggleMenu = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const barangDifilter = daftarBarang.filter((b) => {
    const cocokKategori = kategoriAktif === "Semua" || b.kategori === kategoriAktif;
    const cocokPencarian = b.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return cocokKategori && cocokPencarian;
  });

  return (
    <div className="min-h-screen bg-[#0B1329] text-slate-200 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#1C2541] rounded-2xl p-6 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-300">Memproses...</p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-emerald-500 text-[#0B1329] px-6 py-3 rounded-xl font-bold text-center text-xs sm:text-sm shadow-2xl z-50 transition-all duration-300">
          ✨ {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <div className="sticky top-0 z-30 bg-[#1C2541]/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-[#0B1329]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">TOKO ARKAN</h1>
          </div>

          <div className="w-44 sm:w-64 relative">
            <input
              type="text"
              placeholder="Cari barang...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1329] text-xs sm:text-sm text-slate-200 pl-9 pr-3 py-1.5 sm:py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-slate-500 transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-slate-400 hover:text-white w-4 h-4 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </nav>

        {/* Kategori Bar */}
        <div className="bg-[#151D35] border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
            {listKategori.map((kat) => (
              <button
                key={kat}
                onClick={() => setKategoriAktif(kat)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${kategoriAktif === kat ? "bg-emerald-500 text-[#0B1329]" : "bg-[#1C2541] text-slate-300 border border-slate-800"}`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-52 sm:pb-44">
        <main>
          {barangDifilter.length === 0 ? (
            <div className="text-center py-20 bg-[#1C2541]/40 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-400 text-sm font-semibold">Barang tidak ditemukan atau database kosong 🔍</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setKategoriAktif("Semua");
                }}
                className="mt-3 text-xs text-emerald-400 hover:underline"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {barangDifilter.map((barang) => {
                const idxVar = variasiTerpilih[barang.id] || 0;
                const infoVariasiAktif = barang.opsiVariasi[idxVar] || barang.opsiVariasi[0];
                const keyItemKeranjang = `${barang.id}-${infoVariasiAktif.namaVariasi}`;
                const kuantitasDiKeranjang = keranjang[keyItemKeranjang] || 0;

                return (
                  <div key={barang.id} className="bg-[#1C2541] rounded-2xl overflow-hidden border border-slate-800 shadow-lg flex flex-col relative group">
                    <div className="relative aspect-square bg-[#0B1329] overflow-hidden w-full">
                      <img src={barang.gambarUrl} alt={barang.nama} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-[#0B1329]/90 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded-lg uppercase border border-slate-800 z-10">{barang.kategori}</span>

                      {/* Menu three dots */}
                      <div className="absolute top-2 right-2 z-20" ref={(el) => (menuRef.current[barang.id] = el)}>
                        <button
                          onClick={() => toggleMenu(barang.id)}
                          className="bg-[#0B1329]/80 text-white p-1.5 rounded-lg border border-slate-800 shadow-md backdrop-blur-sm transition focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                        {activeMenuId === barang.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-[#0B1329] border border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 z-30">
                            <button onClick={() => handleEditClick(barang)} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1C2541] text-sky-400 transition">
                              ✏️ Ubah
                            </button>
                            <button
                              onClick={() => handleDeleteClick(barang.id)}
                              className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1C2541] text-rose-400 transition border-t border-slate-800"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 leading-tight">{barang.nama}</h3>

                        {/* Variasi Panel */}
                        {barang.opsiVariasi.length > 1 && (
                          <div className="mt-3 flex flex-wrap gap-1 bg-[#0B1329] p-1 rounded-xl border border-slate-800">
                            {barang.opsiVariasi.map((v, index) => (
                              <button
                                key={v.namaVariasi}
                                onClick={() => setVariasiTerpilih({ ...variasiTerpilih, [barang.id]: index })}
                                className={`flex-1 text-[10px] font-bold py-1.5 px-1 rounded-lg text-center transition whitespace-nowrap ${idxVar === index ? "bg-emerald-500 text-[#0B1329] shadow" : "text-slate-400 hover:text-white"}`}
                              >
                                {v.namaVariasi}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-2 sm:pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 block tracking-wide">Harga Jual</span>
                          <span className="text-base sm:text-lg font-black text-emerald-400 block whitespace-nowrap">Rp {infoVariasiAktif.harga.toLocaleString("id-ID")}</span>
                        </div>

                        <div className="w-full sm:w-28 flex-shrink-0">
                          {kuantitasDiKeranjang === 0 ? (
                            <button
                              onClick={() => tambahKuantitas(barang.id, infoVariasiAktif.namaVariasi)}
                              className="w-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-[#0B1329] font-bold py-2 sm:py-1.5 px-3 rounded-xl text-xs transition-all border border-emerald-500/30 shadow-md text-center"
                            >
                              + Tambah
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-[#0B1329] rounded-xl border border-slate-800 p-1 w-full shadow-inner">
                              <button
                                onClick={() => kurangKuantitas(keyItemKeranjang)}
                                className="bg-[#1C2541] text-rose-400 font-extrabold w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors hover:bg-rose-500/10"
                              >
                                -
                              </button>
                              <span className="font-black text-xs text-white px-1">{kuantitasDiKeranjang}</span>
                              <button
                                onClick={() => tambahKuantitas(barang.id, infoVariasiAktif.namaVariasi)}
                                className="bg-[#1C2541] text-emerald-400 font-extrabold w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Footer Total Tagihan */}
      {totalItem > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1C2541]/95 border-t border-slate-800 shadow-2xl z-40 p-4 max-w-4xl mx-auto rounded-t-3xl backdrop-blur-md">
          <div className="mb-2 flex justify-between items-center px-1">
            <button onClick={() => setShowDetail(!showDetail)} className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition">
              {showDetail ? "⬇ Sembunyikan Rincian" : "⬆ Lihat Rincian Barang"}
            </button>
            <button onClick={handleClearKeranjang} className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-md transition">
              🗑️ Kosongkan
            </button>
          </div>
          {showDetail && (
            <div className="max-h-36 overflow-y-auto space-y-2 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-fade-in px-1">
              {detailProdukTerpilih.map((item) => (
                <div key={item.keyKeranjang} className="flex justify-between items-center text-xs bg-[#0B1329] p-2.5 rounded-xl border border-slate-800">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-bold text-white block truncate text-xs">{item.nama}</span>
                    <span className="text-slate-400 text-[11px]">
                      {item.jumlah}x Rp {item.harga.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-emerald-400 text-xs">Rp {item.subTotal.toLocaleString("id-ID")}</span>
                    <button
                      onClick={() => kurangKuantitas(item.keyKeranjang)}
                      className="bg-[#1C2541] text-rose-400 border border-slate-800 w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2.5">
              <div className="bg-emerald-500 text-[#0B1329] font-black rounded-lg w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xs shadow-md">{totalItem}</div>
              <div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Total Tagihan</p>
                <p className="text-base sm:text-lg font-black text-emerald-400">Rp {totalHarga.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setToastMessage("Transaksi Sukses diproses!");
                setKeranjang({});
                setShowDetail(false);
              }}
              className="bg-emerald-500 text-[#0B1329] px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-xs shadow-lg transition"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* FAB Tombol Tambah */}
      {totalItem === 0 && (
        <button
          onClick={() => {
            setIsEditMode(false);
            setIsOpen(true);
          }}
          className="fixed bottom-5 right-5 bg-emerald-500 text-[#0B1329] w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center z-40 border border-emerald-400/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Modal Input & Edit */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-[#1C2541] rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-6 relative border border-slate-800 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button onClick={closeFormModal} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#0B1329] p-1.5 rounded-full">
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
                  {listKategori.slice(1).map((k) => (
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
                    onChange={handleHargaUtamaChange}
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
                        onChange={(e) => handleFormLabelChange(index, e.target.value)}
                        className="w-1/3 bg-[#1C2541] border border-slate-800 rounded-lg p-2 text-xs text-white text-center focus:outline-none"
                        placeholder="Misal: 1 Batang"
                        required
                      />
                      <input
                        type="text"
                        value={variasi.hargaText}
                        onChange={(e) => handleFormHargaChange(index, e.target.value)}
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
                <button type="button" onClick={closeFormModal} className="px-4 py-2 bg-[#0B1329] text-slate-300 text-xs sm:text-sm font-semibold rounded-xl">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-500 text-[#0B1329] text-xs sm:text-sm font-bold rounded-xl shadow-lg">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#1C2541] rounded-2xl border border-slate-800 p-6 w-full max-w-sm shadow-2xl relative text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-base font-bold text-white mb-2">Hapus Produk?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus <span className="text-rose-400 font-semibold">"{namaBarangMauDihapus}"</span> dari katalog Toko Arkan? Data akan hilang permanen.
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setBarangIdMauDihapus(null);
                }}
                className="flex-1 px-4 py-2.5 bg-[#0B1329] hover:bg-[#0B1329]/60 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button type="button" onClick={eksekusiHapusBarang} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg transition">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
