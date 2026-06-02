export const formatRupiah = (value) => {
  if (!value) return "";
  const number = value.replace(/\D/g, "");
  if (number === "") return "";
  return "Rp " + Number(number).toLocaleString("id-ID");
};

export const parseRupiahToNumber = (rupiahString) => {
  return Number(rupiahString.replace(/\D/g, "")) || 0;
};
