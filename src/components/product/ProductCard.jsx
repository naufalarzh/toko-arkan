import React, { useRef, useState, useMemo } from "react";
import VariasiSelector from "./VariasiSelector";
import noPictures from "../../assets/no-pictures.png";

const ProductCard = ({ barang, keranjang, tambahKuantitas, kurangKuantitas, onEdit, onDelete, variasiTerpilih, setVariasiTerpilih }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  const idxVar = variasiTerpilih[barang.id] || 0;
  const infoVariasiAktif = barang.opsiVariasi[idxVar] || barang.opsiVariasi[0];
  const keyItemKeranjang = `${barang.id}-${infoVariasiAktif.namaVariasi}`;
  const kuantitasDiKeranjang = keranjang[keyItemKeranjang] || 0;

  const gambarVariasi = infoVariasiAktif?.gambarUrl;
  const gambarUtama = barang?.gambarUrl;

  // OPTIMASI: gunakan useMemo untuk caching hasil perhitungan gambar
  const gambarTampil = useMemo(() => {
    if (gambarVariasi && gambarVariasi !== "" && !gambarVariasi.includes("No Image") && !gambarVariasi.includes("placehold")) {
      // Tambahkan parameter timestamp agar image bisa refresh jika perlu
      return gambarVariasi;
    }
    if (gambarUtama && gambarUtama !== "" && !gambarUtama.includes("No Image") && !gambarUtama.includes("placehold")) {
      return gambarUtama;
    }
    return noPictures;
  }, [gambarVariasi, gambarUtama]); // Re-run hanya jika gambarVariasi/gambarUtama berubah

  const toggleMenu = () => {
    setActiveMenuId(activeMenuId === barang.id ? null : barang.id);
  };

  return (
    <div className="bg-[#1C2541] rounded-2xl overflow-hidden border border-slate-800 shadow-lg flex flex-col relative group">
      <div className="relative aspect-square bg-[#0B1329] overflow-hidden w-full">
        {/* OPTIMASI: tambahkan loading="lazy" dan decoding="async" */}
        <img src={gambarTampil} alt={barang.nama} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <span className="absolute top-2 left-2 bg-[#0B1329]/90 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded-lg uppercase border border-slate-800 z-10">{barang.kategori}</span>

        <div className="absolute top-2 right-2 z-20" ref={menuRef}>
          <button onClick={toggleMenu} className="bg-[#0B1329]/80 text-white p-1.5 rounded-lg border border-slate-800 shadow-md backdrop-blur-sm transition focus:outline-none">
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
              <button
                onClick={() => {
                  onEdit(barang);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1C2541] text-sky-400 transition"
              >
                ✏️ Ubah
              </button>
              <button
                onClick={() => {
                  onDelete(barang.id);
                  setActiveMenuId(null);
                }}
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
          <VariasiSelector opsiVariasi={barang.opsiVariasi} selectedIndex={idxVar} onSelect={(index) => setVariasiTerpilih({ ...variasiTerpilih, [barang.id]: index })} />
        </div>

        <div className="mt-4 pt-2 sm:pt-3 border-t border-slate-800">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 block tracking-wide">HARGA JUAL</span>
            <span className="text-base sm:text-lg font-black text-emerald-400 block">Rp {infoVariasiAktif.harga.toLocaleString("id-ID")}</span>
          </div>

          <div className="mt-3">
            {kuantitasDiKeranjang > 0 ? (
              <div className="flex items-center justify-center space-x-3 bg-[#0B1329] px-3 py-2 rounded-xl border border-slate-800 w-full">
                <button onClick={() => kurangKuantitas(keyItemKeranjang)} className="text-rose-400 font-black text-base w-6 h-6 flex items-center justify-center hover:text-rose-300 transition">
                  -
                </button>
                <span className="text-sm font-bold text-white min-w-[24px] text-center">{kuantitasDiKeranjang}</span>
                <button
                  onClick={() => tambahKuantitas(barang.id, infoVariasiAktif.namaVariasi)}
                  className="text-emerald-400 font-black text-base w-6 h-6 flex items-center justify-center hover:text-emerald-300 transition"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => tambahKuantitas(barang.id, infoVariasiAktif.namaVariasi)}
                className="w-full bg-emerald-500 text-[#0B1329] py-2 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-400 transition"
              >
                + Tambah
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
