import React from "react";

const CartItem = ({ item, kurangKuantitas, tambahKuantitas }) => {
  return (
    <div className="flex justify-between items-center text-xs bg-[#0F0A1A] p-2 rounded-xl border border-amber-500/20">
      <div className="flex-1 min-w-0 pr-2">
        <span className="font-bold text-white block truncate text-xs">{item.nama}</span>
        <span className="text-slate-400 text-[11px]">Rp {item.harga.toLocaleString("id-ID")}</span>
      </div>
      <div className="flex items-center space-x-2.5">
        <span className="font-extrabold text-amber-400 text-xs">Rp {item.subTotal.toLocaleString("id-ID")}</span>
        <div className="flex items-center space-x-1.5 bg-[#0F0A1A] px-2 py-1 rounded-lg border border-amber-500/20">
          <button
            onClick={() => tambahKuantitas(item.keyKeranjang)}
            className="text-amber-400 font-black text-sm w-6 h-6 flex items-center justify-center hover:text-amber-300 hover:bg-amber-500/10 rounded transition"
          >
            +
          </button>
          <span className="text-xs font-bold text-white min-w-[16px] text-center">{item.jumlah}</span>
          <button
            onClick={() => kurangKuantitas(item.keyKeranjang)}
            className="text-rose-400 font-black text-sm w-6 h-6 flex items-center justify-center hover:text-rose-300 hover:bg-rose-500/10 rounded transition"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
