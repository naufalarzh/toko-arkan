import { useState, useEffect } from "react";

export const useCart = () => {
  const [keranjang, setKeranjang] = useState({});

  // Load dari localStorage saat pertama kali mount
  useEffect(() => {
    const stored = localStorage.getItem("keranjang");
    if (stored) {
      setKeranjang(JSON.parse(stored));
    }
  }, []);

  // Simpan ke localStorage setiap kali keranjang berubah
  useEffect(() => {
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
  }, [keranjang]);

  /**
   * Tambah kuantitas item di keranjang
   * Bisa dipanggil dengan 2 cara:
   * 1. tambahKuantitas(barangId, namaVariasi) - dari ProductCard
   * 2. tambahKuantitas(keyKeranjang) - dari CartItem
   */
  const tambahKuantitas = (param1, param2) => {
    let key;
    if (param2 !== undefined) {
      // Dipanggil dengan (barangId, namaVariasi)
      key = `${param1}-${param2}`;
    } else {
      // Dipanggil dengan (keyKeranjang) saja
      key = param1;
    }

    setKeranjang((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  /**
   * Kurangi kuantitas item di keranjang
   * Jika kuantitas <= 1, hapus item dari keranjang
   */
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

  /**
   * Kosongkan seluruh keranjang
   */
  const clearCart = () => {
    setKeranjang({});
  };

  /**
   * Hitung total belanja berdasarkan daftar barang
   * Return: { totalHarga, totalItem, detailProdukTerpilih }
   */
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
