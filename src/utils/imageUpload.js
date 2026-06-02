import { supabase } from "../supabaseClient";

export const uploadGambarKeStorage = async (file, oldImageUrl = null) => {
  if (!file) return null;

  if (oldImageUrl && oldImageUrl.includes("supabase.co")) {
    const oldPath = oldImageUrl.split("/").pop();
    await supabase.storage.from("produk-images").remove([oldPath]);
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("produk-images").upload(fileName, file);
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("produk-images").getPublicUrl(fileName);
  return publicUrl;
};
