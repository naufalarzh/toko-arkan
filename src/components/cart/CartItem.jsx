import React from "react";

const CartItem = ({ item, kurangKuantitas }) => {
  return (
    <div className="flex justify-between items-center text-xs bg-[#0B1329] p-2.5 rounded-xl border border-slate-800">
      <div className="flex-1 min-w-0 pr-2">
        <span className="font-bold text-white block truncate text-xs">{item.nama}</span>
        <span className="text-slate-400 text-[11px]">
          {item.jumlah}x Rp {item.harga.toLocaleString("id-ID")}
        </span>
      </div>
      <div className="flex items-center space-x-2.5">
        <span className="font-extrabold text-emerald-400 text-xs">Rp {item.subTotal.toLocaleString("id-ID")}</span>
        <button onClick={() => kurangKuantitas(item.keyKeranjang)} className="bg-[#1C2541] text-rose-400 border border-slate-800 w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs">
          -
        </button>
      </div>
    </div>
  );
};

export default CartItem;
