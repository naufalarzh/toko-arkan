import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getRandomColor } from "../constants/colors";
import { parsePrice } from "../utils/helpers";
import { uploadImage, deleteImage } from "../utils/imageUpload";

const ProductContext = createContext();

const normalizeProduct = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  variants: (row.product_variants || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v, idx) => ({
      typeName: v.type_name,
      price: "Rp " + Number(v.price).toLocaleString("id-ID"),
      priceNumber: v.price,
      image: v.image_path,
      colorClass: getRandomColor(idx),
    })),
});

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*, product_variants(*)").order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal fetch produk:", error);
      setProducts([]);
    } else {
      setProducts((data || []).map(normalizeProduct));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (product) => {
    // Insert product
    const { data: prod, error: errProd } = await supabase.from("products").insert({ name: product.name, category: product.category }).select().single();

    if (errProd) throw errProd;

    // Insert variants
    const variantsPayload = product.variants.map((v, idx) => ({
      product_id: prod.id,
      type_name: v.typeName,
      price: parsePrice(v.price),
      image_path: v.image.startsWith("http") || v.image === "__DEFAULT__" ? null : v.image,
      sort_order: idx,
    }));

    const { error: errVar } = await supabase.from("product_variants").insert(variantsPayload);
    if (errVar) throw errVar;

    await fetchProducts();
  };

  const updateProduct = async (id, updatedData) => {
    // Update nama & kategori
    const { error: errProd } = await supabase.from("products").update({ name: updatedData.name, category: updatedData.category }).eq("id", id);

    if (errProd) throw errProd;

    // Ambil varian lama untuk hapus file storage yang tidak dipakai
    const { data: oldVariants } = await supabase.from("product_variants").select("image_path").eq("product_id", id);

    const oldPaths = (oldVariants || []).map((v) => v.image_path).filter(Boolean);
    const newPaths = updatedData.variants.map((v) => (v.image.startsWith("http") || v.image === "__DEFAULT__" ? null : v.image)).filter(Boolean);

    // Hapus varian lama (replace)
    await supabase.from("product_variants").delete().eq("product_id", id);

    // Insert varian baru
    const variantsPayload = updatedData.variants.map((v, idx) => ({
      product_id: id,
      type_name: v.typeName,
      price: parsePrice(v.price),
      image_path: v.image.startsWith("http") || v.image === "__DEFAULT__" ? null : v.image,
      sort_order: idx,
    }));

    const { error: errVar } = await supabase.from("product_variants").insert(variantsPayload);
    if (errVar) throw errVar;

    // Hapus file storage yang tidak lagi dipakai
    const orphaned = oldPaths.filter((p) => !newPaths.includes(p));
    await Promise.all(orphaned.map((p) => deleteImage(p).catch(() => {})));

    await fetchProducts();
  };

  const deleteProduct = async (id) => {
    // Ambil path gambar dulu untuk dihapus dari storage
    const { data: variants } = await supabase.from("product_variants").select("image_path").eq("product_id", id);

    const paths = (variants || []).map((v) => v.image_path).filter(Boolean);

    // Hapus produk (varian ikut terhapus via ON DELETE CASCADE)
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    // Hapus file storage
    await Promise.all(paths.map((p) => deleteImage(p).catch(() => {})));

    await fetchProducts();
  };

  const resetToDefault = async () => {
    // Hapus semua produk
    const { error } = await supabase.from("products").delete().neq("id", 0);
    if (error) throw error;

    // Kalau Anda masih punya RAW_PRODUCTS, bisa insert ulang di sini
    // ...

    await fetchProducts();
  };

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    refetch: fetchProducts,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts harus dipakai di dalam ProductProvider");
  return ctx;
}
