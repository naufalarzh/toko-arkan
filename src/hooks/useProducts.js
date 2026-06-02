import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

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

  const saveProduct = async (productData, isEditMode, editId) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        const { error } = await supabase.from("products").update(productData).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
      }
      await fetchData();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id, gambarUrl) => {
    setIsLoading(true);
    try {
      if (gambarUrl && gambarUrl.includes("supabase.co")) {
        const fileName = gambarUrl.split("/").pop();
        await supabase.storage.from("produk-images").remove([fileName]);
      }

      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      await fetchData();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { daftarBarang, isLoading, setIsLoading, saveProduct, deleteProduct, fetchData };
};
