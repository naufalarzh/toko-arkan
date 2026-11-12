import imageCompression from "browser-image-compression";
import { supabase, BUCKET_NAME } from "../lib/supabase";

// TARGET RASIO 1:1 (PERSEGI) SEPERTI SHOPEE
const TARGET_RATIO = 1;

/**
 * Crop gambar ke rasio target via Canvas.
 */
const cropToRatio = (file, ratio) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const srcRatio = img.width / img.height;
        let sx, sy, sw, sh;

        if (srcRatio > ratio) {
          // Gambar lebih lebar dari target → crop kiri-kanan
          sh = img.height;
          sw = sh * ratio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          // Gambar lebih tinggi dari target → crop atas-bawah
          sw = img.width;
          sh = sw / ratio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }

        canvas.width = sw;
        canvas.height = sh;

        // Background putih (kalau ada transparansi)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sw, sh);

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Gagal crop gambar"));
              return;
            }
            const cropped = new File([blob], file.name || "image.webp", {
              type: "image/webp",
            });
            resolve(cropped);
          },
          "image/webp",
          0.9,
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal load gambar untuk crop"));
    };

    img.src = url;
  });
};

export const uploadImage = async (file) => {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");

  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.85,
  });

  const cropped = await cropToRatio(compressed, TARGET_RATIO);

  const finalFile = await imageCompression(cropped, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.85,
  });

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, finalFile, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw error;
  return filePath;
};

export const deleteImage = async (path) => {
  if (!path) return;
  if (path === "__DEFAULT__" || path.startsWith("http") || path.startsWith("data:")) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  if (error) {
    console.error("Gagal hapus gambar:", error);
    throw error;
  }
};

export const getImageUrl = (path, opts = {}) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Karena paket gratis tidak support transform, kita ambil URL aslinya
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
};
