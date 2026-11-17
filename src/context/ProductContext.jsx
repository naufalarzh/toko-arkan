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
    const { data, error } = await supabase.from("products").select("*, product_variants(*)").order("name", { ascending: true });

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
    const { data: prod, error: errProd } = await supabase.from("products").insert({ name: product.name, category: product.category }).select().single();

    if (errProd) throw errProd;

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
    return prod.id; // PENTING: Mengembalikan ID untuk highlight di tabel
  };

  const updateProduct = async (id, updatedData) => {
    const { error: errProd } = await supabase.from("products").update({ name: updatedData.name, category: updatedData.category }).eq("id", id);

    if (errProd) throw errProd;

    const { data: oldVariants } = await supabase.from("product_variants").select("image_path").eq("product_id", id);

    const oldPaths = (oldVariants || []).map((v) => v.image_path).filter(Boolean);
    const newPaths = updatedData.variants.map((v) => (v.image.startsWith("http") || v.image === "__DEFAULT__" ? null : v.image)).filter(Boolean);

    await supabase.from("product_variants").delete().eq("product_id", id);

    const variantsPayload = updatedData.variants.map((v, idx) => ({
      product_id: id,
      type_name: v.typeName,
      price: parsePrice(v.price),
      image_path: v.image.startsWith("http") || v.image === "__DEFAULT__" ? null : v.image,
      sort_order: idx,
    }));

    const { error: errVar } = await supabase.from("product_variants").insert(variantsPayload);
    if (errVar) throw errVar;

    const orphaned = oldPaths.filter((p) => !newPaths.includes(p));
    await Promise.all(orphaned.map((p) => deleteImage(p).catch(() => {})));

    await fetchProducts();
  };

  const deleteProduct = async (id) => {
    const { data: variants } = await supabase.from("product_variants").select("image_path").eq("product_id", id);

    const paths = (variants || []).map((v) => v.image_path).filter(Boolean);

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    await Promise.all(paths.map((p) => deleteImage(p).catch(() => {})));

    await fetchProducts();
  };

  const resetToDefault = async () => {
    const { error } = await supabase.from("products").delete().neq("id", 0);
    if (error) throw error;
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
