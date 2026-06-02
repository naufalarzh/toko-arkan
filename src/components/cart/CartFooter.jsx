import React from "react";
import CartDetail from "./CartDetail";

const CartFooter = ({ totalItem, totalHarga, detailProduk, kurangKuantitas, onClearCart, onCheckout, showDetail, setShowDetail }) => {
  if (totalItem === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1C2541]/95 border-t border-slate-800 shadow-2xl z-40 p-4 max-w-4xl mx-auto rounded-t-3xl backdrop-blur-md">
      <div className="mb-2 flex justify-between items-center px-1">
        <button onClick={() => setShowDetail(!showDetail)} className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition">
          {showDetail ? "⬇ Sembunyikan Rincian" : "⬆ Lihat Rincian Barang"}
        </button>
        <button onClick={onClearCart} className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-md transition">
          🗑️ Kosongkan
        </button>
      </div>

      <CartDetail detailProduk={detailProduk} kurangKuantitas={kurangKuantitas} showDetail={showDetail} setShowDetail={setShowDetail} />

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-500 text-[#0B1329] font-black rounded-lg w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xs shadow-md">{totalItem}</div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Total Tagihan</p>
            <p className="text-base sm:text-lg font-black text-emerald-400">Rp {totalHarga.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <button onClick={onCheckout} className="bg-emerald-500 text-[#0B1329] px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-xs shadow-lg transition">
          Selesai
        </button>
      </div>
    </div>
  );
};

export default CartFooter;
