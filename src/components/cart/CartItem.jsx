import React from "react";

const CartItem = ({ item, kurangKuantitas }) => {
  return (
    <div className="flex justify-between items-center text-xs bg-[#0B1329] p-2.5 rounded-xl border border-slate-800">
      <div className="flex-1 min-w-0 pr-2">
        <span className="font-bold text-white block truncate text-xs">{item.nama}</span>
        <span className="text-slate-400 text-[11px]">Rp {item.harga.toLocaleString("id-ID")}</span>
      </div>
      <div className="flex items-center space-x-2.5">
        <span className="font-extrabold text-emerald-400 text-xs">Rp {item.subTotal.toLocaleString("id-ID")}</span>
        <div className="flex items-center space-x-1 bg-[#0B1329] px-2 py-1 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400">{item.jumlah}</span>
          <button onClick={() => kurangKuantitas(item.keyKeranjang)} className="text-rose-400 font-black text-xs hover:text-rose-300">
            -
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
