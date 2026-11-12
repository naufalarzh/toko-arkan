import { getImageUrl } from "./imageUpload";
import noImage from "../assets/noimage.png";

export const DEFAULT_IMAGE = "__DEFAULT__";

export const resolveImage = (img, width = 400) => {
  if (!img || img === DEFAULT_IMAGE) return noImage;
  if (img.startsWith("http") || img.startsWith("data:")) return img;

  return getImageUrl(img) || noImage;
};

export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = noImage;
};

export { noImage };
