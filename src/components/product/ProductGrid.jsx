import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, keranjang, tambahKuantitas, kurangKuantitas, onEdit, onDelete, variasiTerpilih, setVariasiTerpilih }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1C2541]/40 rounded-3xl border border-dashed border-slate-800">
        <p className="text-slate-400 text-sm font-semibold">Barang tidak ditemukan atau database kosong 🔍</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      {products.map((barang) => (
        <ProductCard
          key={barang.id}
          barang={barang}
          keranjang={keranjang}
          tambahKuantitas={tambahKuantitas}
          kurangKuantitas={kurangKuantitas}
          onEdit={onEdit}
          onDelete={onDelete}
          variasiTerpilih={variasiTerpilih}
          setVariasiTerpilih={setVariasiTerpilih}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
