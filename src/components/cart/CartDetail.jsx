import React from "react";
import CartItem from "./CartItem";

const CartDetail = ({ detailProduk, kurangKuantitas, showDetail, setShowDetail }) => {
  if (!showDetail) return null;

  return (
    <div className="max-h-36 overflow-y-auto space-y-2 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-fade-in px-1">
      {detailProduk.map((item) => (
        <CartItem key={item.keyKeranjang} item={item} kurangKuantitas={kurangKuantitas} />
      ))}
    </div>
  );
};

export default CartDetail;
