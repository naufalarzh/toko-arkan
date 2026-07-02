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

  const gambarTampil = useMemo(() => {
    if (gambarVariasi && gambarVariasi !== "" && !gambarVariasi.includes("No Image") && !gambarVariasi.includes("placehold")) {
      return gambarVariasi;
    }
    if (gambarUtama && gambarUtama !== "" && !gambarUtama.includes("No Image") && !gambarUtama.includes("placehold")) {
      return gambarUtama;
    }
    return noPictures;
  }, [gambarVariasi, gambarUtama]);

  const toggleMenu = () => {
    setActiveMenuId(activeMenuId === barang.id ? null : barang.id);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col relative group border border-[#DADCE0]">
      <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden w-full">
        <img src={gambarTampil} alt={barang.nama} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <span className="absolute top-2 left-2 bg-white/90 text-[#1A73E8] text-[9px] font-bold px-2 py-1 rounded-lg border border-[#DADCE0] z-10 shadow-sm">{barang.kategori}</span>

        <div className="absolute top-2 right-2 z-20" ref={menuRef}>
          <button onClick={toggleMenu} className="bg-white/90 text-[#5F6368] p-1.5 rounded-lg border border-[#DADCE0] shadow-sm transition focus:outline-none hover:bg-[#F1F3F4] hover:text-[#202124]">
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
            <div className="absolute right-0 mt-1 w-28 bg-white rounded-xl shadow-xl overflow-hidden py-1 z-10 border border-[#DADCE0]">
              <button
                onClick={() => {
                  onEdit(barang);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#F1F3F4] text-[#1A73E8] transition"
              >
                ✏️ Ubah
              </button>
              <button
                onClick={() => {
                  onDelete(barang.id);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#F1F3F4] text-[#D93025] transition border-t border-[#DADCE0]"
              >
                🗑️ Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#202124] text-sm sm:text-base line-clamp-2 leading-tight">{barang.nama}</h3>
          <VariasiSelector opsiVariasi={barang.opsiVariasi} selectedIndex={idxVar} onSelect={(index) => setVariasiTerpilih({ ...variasiTerpilih, [barang.id]: index })} />
        </div>

        <div className="mt-4 pt-2 sm:pt-3 border-t border-[#DADCE0]">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#9AA0A6] block tracking-wide">HARGA JUAL</span>
            <span className="text-base sm:text-lg font-black text-[#1A73E8] block">Rp {infoVariasiAktif.harga.toLocaleString("id-ID")}</span>
          </div>

          <div className="mt-3">
            {kuantitasDiKeranjang > 0 ? (
              <div className="flex items-center justify-center space-x-3 bg-[#F8F9FA] px-3 py-2 rounded-xl w-full border border-[#DADCE0]">
                {/* MINUS - DI KIRI */}
                <button
                  onClick={() => kurangKuantitas(keyItemKeranjang)}
                  className="text-[#D93025] font-black text-lg w-8 h-8 flex items-center justify-center hover:text-[#B3261E] hover:bg-[#D93025]/10 rounded-lg transition"
                >
                  −
                </button>
                <span className="text-sm font-bold text-[#202124] min-w-[28px] text-center">{kuantitasDiKeranjang}</span>
                {/* PLUS - DI KANAN */}
                <button
                  onClick={() => tambahKuantitas(barang.id, infoVariasiAktif.namaVariasi)}
                  className="text-[#1A73E8] font-black text-lg w-8 h-8 flex items-center justify-center hover:text-[#1557B0] hover:bg-[#1A73E8]/10 rounded-lg transition"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => tambahKuantitas(barang.id, infoVariasiAktif.namaVariasi)}
                className="w-full bg-[#1A73E8] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#1557B0] transition shadow-sm"
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
