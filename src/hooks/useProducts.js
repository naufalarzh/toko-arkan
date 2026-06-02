import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { uploadGambarKeStorage } from "../utils/imageUpload";

export const useProducts = () => {
  const [daftarBarang, setDaftarBarang] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const formattedData = data.map((item) => ({
        id: item.id,
        nama: item.nama,
        kategori: item.kategori,
        gambarUrl: item.gambar_url,
        opsiVariasi: item.opsi_variasi,
      }));

      setDaftarBarang(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();

    const subscription = supabase
      .channel("public:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchData();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const saveProduct = async (productData, isEditMode, editId, oldVariasi = null) => {
    setIsLoading(true);
    try {
      // Upload gambar untuk setiap variasi yang punya file baru
      const opsiVariasiWithUrls = await Promise.all(
        productData.opsi_variasi.map(async (variasi) => {
          if (variasi.gambarFile) {
            const oldUrl = oldVariasi?.find((v) => v.namaVariasi === variasi.namaVariasi)?.gambarUrl;
            const uploadedUrl = await uploadGambarKeStorage(variasi.gambarFile, oldUrl);
            return { ...variasi, gambarUrl: uploadedUrl, gambarFile: undefined };
          }
          return { ...variasi, gambarFile: undefined };
        }),
      );

      const productToSave = {
        nama: productData.nama,
        kategori: productData.kategori,
        opsi_variasi: opsiVariasiWithUrls,
      };

      if (isEditMode) {
        const { error } = await supabase.from("products").update(productToSave).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([productToSave]);
        if (error) throw error;
      }
      await fetchData();
      return { success: true };
    } catch (error) {
      console.error("Error saving product:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id, opsiVariasi) => {
    setIsLoading(true);
    try {
      // Hapus semua gambar variasi dari storage
      for (const variasi of opsiVariasi) {
        if (variasi.gambarUrl && variasi.gambarUrl.includes("supabase.co")) {
          const fileName = variasi.gambarUrl.split("/").pop();
          await supabase.storage.from("produk-images").remove([fileName]);
        }
      }

      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      await fetchData();
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { daftarBarang, isLoading, setIsLoading, saveProduct, deleteProduct, fetchData };
};
