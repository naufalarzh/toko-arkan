import { useState, useEffect } from "react";

export const useCart = () => {
  const [keranjang, setKeranjang] = useState({});

  useEffect(() => {
    const storedKeranjang = localStorage.getItem("keranjang");
    if (storedKeranjang) {
      setKeranjang(JSON.parse(storedKeranjang));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
  }, [keranjang]);

  const tambahKuantitas = (barangId, namaVariasi) => {
    const keyKeranjang = `${barangId}-${namaVariasi}`;
    setKeranjang((prev) => ({ ...prev, [keyKeranjang]: (prev[keyKeranjang] || 0) + 1 }));
  };

  const kurangKuantitas = (keyKeranjang) => {
    setKeranjang((prev) => {
      const current = prev[keyKeranjang] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[keyKeranjang];
        return copy;
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

    Object.keys(keranjang).forEach((keyKeranjang) => {
      const [barangId, namaVariasi] = keyKeranjang.split("-");
      const barang = daftarBarang.find((b) => b.id === barangId);

      if (barang) {
        const variasi = barang.opsiVariasi.find((v) => v.namaVariasi === namaVariasi);
        if (variasi) {
          const subTotal = variasi.harga * keranjang[keyKeranjang];
          totalHarga += subTotal;
          totalItem += keranjang[keyKeranjang];
          detailProdukTerpilih.push({
            keyKeranjang,
            nama: `${barang.nama} (${variasi.namaVariasi})`,
            harga: variasi.harga,
            jumlah: keranjang[keyKeranjang],
            subTotal,
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
