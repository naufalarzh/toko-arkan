import { getImageUrl } from "./imageUpload";
import noImage from "../assets/noimage.png";

export const DEFAULT_IMAGE = "__DEFAULT__";

/**
 * Resolve gambar dari berbagai sumber jadi URL yang bisa dipakai di <img>.
 * @param {string} img - path storage / URL / data-URL / "__DEFAULT__"
 * @param {number} width - lebar untuk transform Supabase
 * @returns {string} URL gambar siap pakai
 */
export const resolveImage = (img, width = 400) => {
  if (!img || img === DEFAULT_IMAGE) return noImage;
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return getImageUrl(img, { width }) || noImage;
};

/**
 * Handler onError standar untuk <img>.
 * Cegah infinite loop + fallback ke noImage.
 */
export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = noImage;
};

export { noImage };
