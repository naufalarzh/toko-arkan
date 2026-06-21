import { supabase } from "../supabaseClient";
import imageCompression from "browser-image-compression";

export const uploadGambarKeStorage = async (file, oldImageUrl = null) => {
  if (!file) return null;

  // ========== KOMPRESI GAMBAR ==========
  const options = {
    maxSizeMB: 0.3, // Maksimal 300 KB
    maxWidthOrHeight: 1200, // Maksimal dimensi 1200px
    useWebWorker: true, // Biar gak nge-freeze UI
    quality: 0.85, // Kualitas 85% (sangat bagus!)
    fileType: "image/jpeg", // Ubah ke JPEG (lebih kecil)
  };

  let compressedFile;
  try {
    compressedFile = await imageCompression(file, options);
  } catch (error) {
    console.warn("Kompresi gagal, pakai file asli:", error);
    compressedFile = file; // Fallback ke file asli
  }
  // ======================================

  // Hapus gambar lama jika ada
  if (oldImageUrl && oldImageUrl.includes("supabase.co")) {
    const oldPath = oldImageUrl.split("/").pop();
    await supabase.storage.from("produk-images").remove([oldPath]);
  }

  // Generate nama file unik
  const fileExt = compressedFile.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload file hasil kompresi
  const { error: uploadError } = await supabase.storage.from("produk-images").upload(fileName, compressedFile);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("produk-images").getPublicUrl(fileName);

  return publicUrl;
};
