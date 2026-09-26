import imageCompression from "browser-image-compression";
import { supabase, BUCKET_NAME } from "../lib/supabase";

/**
 * Kompres gambar lalu upload ke Supabase Storage.
 * @param {File} file - File dari input / paste
 * @returns {Promise<string>} - Path file di storage (bukan URL full)
 */
export const uploadImage = async (file) => {
  if (!file) return null;

  // Validasi
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar");
  }

  // Kompres → WebP, max 0.5MB, max 1920px
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  });

  // Buat nama file unik
  const ext = "webp";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `products/${fileName}`;

  // Upload
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, compressed, {
    contentType: "image/webp",
    cacheControl: "31536000", // cache 1 tahun
    upsert: false,
  });

  if (error) throw error;

  return filePath; // simpan path-nya saja di DB
};

/**
 * Hapus gambar dari storage.
 * @param {string} path - Path file di storage
 */
export const deleteImage = async (path) => {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  if (error) console.error("Gagal hapus gambar:", error);
};

/**
 * Dapatkan URL publik gambar dengan transformasi (resize + WebP otomatis).
 * @param {string} path - Path file di storage
 * @param {object} opts - { width, height, quality }
 */
export const getImageUrl = (path, opts = {}) => {
  if (!path) return null;

  // Kalau path sudah URL penuh (misal dari data lama), return as-is
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const { width = 400, height, quality = 75 } = opts;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path, {
    transform: {
      width,
      ...(height && { height }),
      quality,
      resize: "cover",
    },
  });

  return data.publicUrl;
};
