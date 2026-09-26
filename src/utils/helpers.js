export const parsePrice = (priceStr) => parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;

export const formatPrice = (num) => "Rp " + num.toLocaleString("id-ID");
