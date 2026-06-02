import { useState, useEffect } from "react";

export const useCart = () => {
  const [keranjang, setKeranjang] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("keranjang");
    if (stored) {
      setKeranjang(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
  }, [keranjang]);

  const tambahKuantitas = (barangId, namaVariasi) => {
    const key = `${barangId}-${namaVariasi}`;
    setKeranjang((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const kurangKuantitas = (keyKeranjang) => {
    setKeranjang((prev) => {
      const current = prev[keyKeranjang] || 0;
      if (current <= 1) {
        const newCart = { ...prev };
        delete newCart[keyKeranjang];
        return newCart;
      }
      return { ...prev, [keyKeranjang]: current - 1 };
    });
  };

  const clearCart = () => {
    setKeranjang({});
  };

  const hitungTotalBelanja = (daftarBarang) => {
    let totalHarga = 0;
    let totalItem = 0;
    const detailProdukTerpilih = [];

    Object.keys(keranjang).forEach((key) => {
      const lastHyphenIndex = key.lastIndexOf("-");
      const barangId = key.substring(0, lastHyphenIndex);
      const namaVariasi = key.substring(lastHyphenIndex + 1);

      const barang = daftarBarang.find((b) => b.id === barangId);

      if (barang && barang.opsiVariasi) {
        const variasi = barang.opsiVariasi.find((v) => v.namaVariasi === namaVariasi);
        if (variasi) {
          const jumlah = keranjang[key];
          const subTotal = variasi.harga * jumlah;
          totalHarga += subTotal;
          totalItem += jumlah;
          detailProdukTerpilih.push({
            keyKeranjang: key,
            nama: `${barang.nama} (${variasi.namaVariasi})`,
            harga: variasi.harga,
            jumlah: jumlah,
            subTotal: subTotal,
          });
        }
      }
    });

    return { totalHarga, totalItem, detailProdukTerpilih };
  };

  return {
    keranjang,
    tambahKuantitas,
    kurangKuantitas,
    clearCart,
    hitungTotalBelanja,
  };
};
