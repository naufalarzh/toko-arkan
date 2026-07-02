import React from "react";

const CartItem = ({ item, kurangKuantitas, tambahKuantitas }) => {
  return (
    <div className="flex justify-between items-center text-xs bg-[#F8F9FA] p-2 rounded-xl border border-[#DADCE0] shadow-sm">
      <div className="flex-1 min-w-0 pr-2">
        <span className="font-bold text-[#202124] block truncate text-xs">{item.nama}</span>
        <span className="text-[#5F6368] text-[11px]">Rp {item.harga.toLocaleString("id-ID")}</span>
      </div>
      <div className="flex items-center space-x-2.5">
        <span className="font-extrabold text-[#1A73E8] text-xs">Rp {item.subTotal.toLocaleString("id-ID")}</span>
        <div className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-lg border border-[#DADCE0]">
          {/* MINUS - DI KIRI */}
          <button
            onClick={() => kurangKuantitas(item.keyKeranjang)}
            className="text-[#D93025] font-black text-sm w-6 h-6 flex items-center justify-center hover:text-[#B3261E] hover:bg-[#D93025]/10 rounded transition"
          >
            −
          </button>
          <span className="text-xs font-bold text-[#202124] min-w-[16px] text-center">{item.jumlah}</span>
          {/* PLUS - DI KANAN */}
          <button
            onClick={() => tambahKuantitas(item.keyKeranjang)}
            className="text-[#1A73E8] font-black text-sm w-6 h-6 flex items-center justify-center hover:text-[#1557B0] hover:bg-[#1A73E8]/10 rounded transition"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
