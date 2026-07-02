import React from "react";
import CartDetail from "./CartDetail";

const CartFooter = ({ totalItem, totalHarga, detailProduk, kurangKuantitas, tambahKuantitas, onClearCart, onCheckout, showDetail, setShowDetail }) => {
  if (totalItem === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DADCE0] shadow-lg z-40 p-4 max-w-4xl mx-auto rounded-t-3xl">
      <div className="mb-2 flex justify-between items-center px-1">
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="text-xs font-semibold transition px-2.5 py-1 rounded-md bg-[#1A73E8]/10 text-[#1A73E8] hover:text-[#1557B0] hover:bg-[#1A73E8]/20"
        >
          {showDetail ? "🔽 Sembunyikan Rincian" : "🔼 Lihat Rincian Barang"}
        </button>
        <button onClick={onClearCart} className="text-xs text-[#D93025] hover:text-[#B3261E] bg-[#D93025]/10 px-2.5 py-1 rounded-md transition">
          🗑️ Kosongkan
        </button>
      </div>

      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="bg-[#1A73E8] text-white font-black rounded-lg w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xs shadow-sm">{totalItem}</div>
          <div>
            <p className="text-[10px] sm:text-xs text-[#5F6368] font-medium">Total Tagihan</p>
            <p className="text-base sm:text-lg font-black text-[#202124]">Rp {totalHarga.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <button onClick={onCheckout} className="bg-[#1A73E8] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-[#1557B0] transition">
          Selesai
        </button>
      </div>

      <CartDetail detailProduk={detailProduk} kurangKuantitas={kurangKuantitas} tambahKuantitas={tambahKuantitas} showDetail={showDetail} />
    </div>
  );
};

export default CartFooter;
