import React from "react";

const CartItem = ({ item, kurangKuantitas }) => {
  return (
    <div className="flex justify-between items-center text-xs bg-[#0F0A1A] p-2.5 rounded-xl border border-amber-500/20">
      <div className="flex-1 min-w-0 pr-2">
        <span className="font-bold text-white block truncate text-xs">{item.nama}</span>
        <span className="text-slate-400 text-[11px]">Rp {item.harga.toLocaleString("id-ID")}</span>
      </div>
      <div className="flex items-center space-x-2.5">
        <span className="font-extrabold text-amber-400 text-xs">Rp {item.subTotal.toLocaleString("id-ID")}</span>
        <div className="flex items-center space-x-2 bg-[#0F0A1A] px-2.5 py-1.5 rounded-lg border border-amber-500/20">
          <span className="text-xs font-bold text-white min-w-[20px] text-center">{item.jumlah}</span>
          <button
            onClick={() => kurangKuantitas(item.keyKeranjang)}
            className="text-rose-400 font-black text-base w-7 h-7 flex items-center justify-center hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
