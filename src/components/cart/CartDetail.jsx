import React from "react";
import CartItem from "./CartItem";

const CartDetail = ({ detailProduk, kurangKuantitas, tambahKuantitas, showDetail }) => {
  if (!showDetail) return null;

  if (detailProduk.length === 0) {
    return <div className="text-center py-3 text-[#5F6368] text-xs">Keranjang kosong</div>;
  }

  return (
    <div className="max-h-48 overflow-y-auto space-y-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-fade-in px-1">
      {detailProduk.map((item) => (
        <CartItem key={item.keyKeranjang} item={item} kurangKuantitas={kurangKuantitas} tambahKuantitas={tambahKuantitas} />
      ))}
    </div>
  );
};

export default CartDetail;
