import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, onEdit, onDelete, variasiTerpilih, setVariasiTerpilih }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1C2541]/40 rounded-3xl border border-dashed border-slate-800">
        <p className="text-slate-400 text-sm font-semibold">Barang tidak ditemukan atau database kosong 🔍</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((barang) => (
        <ProductCard key={barang.id} barang={barang} onEdit={onEdit} onDelete={onDelete} variasiTerpilih={variasiTerpilih} setVariasiTerpilih={setVariasiTerpilih} />
      ))}
    </div>
  );
};

export default ProductGrid;
