import imageCompression from "browser-image-compression";
import { supabase, BUCKET_NAME } from "../lib/supabase";

// Rasio standar untuk semua gambar produk (3:4 portrait)
// Ganti ke 1 (1:1 persegi) atau 4/3 (landscape) kalau mau beda
const TARGET_RATIO = 3 / 4;

/**
 * Crop gambar ke rasio target via Canvas.
 * @param {File|Blob} file - File gambar
 * @param {number} ratio - Target rasio (width / height), misal 3/4 = 0.75
 * @returns {Promise<File>} - File hasil crop
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

        // Background putih (kalau nanti ada transparansi)
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

/**
 * Kompres + crop + upload gambar ke Supabase Storage.
 * Semua gambar akan dipaksa ke rasio TARGET_RATIO (3:4).
 * @param {File} file - File dari input / paste
 * @returns {Promise<string>} - Path file di storage
 */
export const uploadImage = async (file) => {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar");
  }

  // 1. Kompres dulu (kurangi size & dimensi)
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.85,
  });

  // 2. Crop ke rasio seragam
  const cropped = await cropToRatio(compressed, TARGET_RATIO);

  // 3. Kompres ulang hasil crop (biar size optimal)
  const finalFile = await imageCompression(cropped, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.85,
  });

  // 4. Generate nama file unik
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = `products/${fileName}`;

  // 5. Upload ke Supabase
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, finalFile, {
    contentType: "image/webp",
    cacheControl: "31536000", // cache 1 tahun
    upsert: false,
  });

  if (error) throw error;

  return filePath;
};

/**
 * Hapus gambar dari storage.
 * @param {string} path - Path file di storage
 */
export const deleteImage = async (path) => {
  if (!path) return;

  // Skip default sentinel & URL eksternal
  if (path === "__DEFAULT__" || path.startsWith("http") || path.startsWith("data:")) {
    return;
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  if (error) {
    console.error("Gagal hapus gambar:", error);
    throw error;
  }
};

/**
 * Dapatkan URL publik gambar dengan transformasi (resize + WebP otomatis).
 * @param {string} path - Path file di storage
 * @param {object} opts - { width, height, quality }
 */
export const getImageUrl = (path, opts = {}) => {
  if (!path) return null;

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
