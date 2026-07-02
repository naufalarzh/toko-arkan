import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/layout/Navbar";
import KategoriBar from "./components/layout/KategoriBar";
import LoadingOverlay from "./components/layout/LoadingOverlay";
import ProductGrid from "./components/product/ProductGrid";
import ProductForm from "./components/product/ProductForm";
import CartFooter from "./components/cart/CartFooter";
import ConfirmDeleteModal from "./components/modals/ConfirmDeleteModal";
import ToastNotification from "./components/modals/ToastNotification";
import { useProducts } from "./hooks/useProducts";
import { useCart } from "./hooks/useCart";
import { useToast } from "./hooks/useToast";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [variasiTerpilih, setVariasiTerpilih] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });

  const { daftarBarang, isLoading, setIsLoading, saveProduct, deleteProduct } = useProducts();
  const { keranjang, tambahKuantitas, kurangKuantitas, clearCart, hitungTotalBelanja } = useCart();
  const { toastMessage, toastType, showToast } = useToast();

  const { totalHarga, totalItem, detailProdukTerpilih } = hitungTotalBelanja(daftarBarang);

  // Preload gambar
  useEffect(() => {
    daftarBarang.forEach((barang) => {
      if (barang.opsiVariasi) {
        barang.opsiVariasi.forEach((variasi) => {
          if (variasi.gambarUrl && !variasi.gambarUrl.includes("No Image") && !variasi.gambarUrl.includes("placehold")) {
            const img = new Image();
            img.src = variasi.gambarUrl;
          }
        });
      }
    });
  }, [daftarBarang]);

  // Scroll ke atas saat kategori berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [kategoriAktif]);

  // Scroll ke atas saat search berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchQuery]);

  // Auto-select variasi berdasarkan search
  useEffect(() => {
    if (!searchQuery.trim()) {
      const resetVariasi = {};
      daftarBarang.forEach((barang) => {
        resetVariasi[barang.id] = 0;
      });
      setVariasiTerpilih(resetVariasi);
      return;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const kataPisah = searchLower.split(" ").filter((kata) => kata.length > 0);

    daftarBarang.forEach((barang) => {
      if (!barang.opsiVariasi || barang.opsiVariasi.length === 0) return;

      const namaProdukLower = barang.nama.toLowerCase();
      const namaVariasiList = barang.opsiVariasi.map((v) => v.namaVariasi.toLowerCase());

      let foundIndex = -1;
      foundIndex = namaVariasiList.findIndex((v) => v.includes(searchLower));

      if (foundIndex === -1 && kataPisah.length > 1) {
        foundIndex = namaVariasiList.findIndex((v) => {
          return kataPisah.every((kata) => v.includes(kata));
        });
      }

      if (foundIndex === -1) {
        const namaCocok = namaProdukLower.includes(searchLower) || (kataPisah.length > 1 && kataPisah.every((kata) => namaProdukLower.includes(kata)));

        if (namaCocok) {
          const firstMatch = namaVariasiList.findIndex((v) => kataPisah.some((kata) => v.includes(kata)));
          foundIndex = firstMatch !== -1 ? firstMatch : 0;
        }
      }

      if (foundIndex === -1) {
        foundIndex = namaVariasiList.findIndex((v) => {
          const kombinasi = `${namaProdukLower} ${v}`;
          return kombinasi.includes(searchLower);
        });
      }

      if (foundIndex !== -1) {
        setVariasiTerpilih((prev) => ({
          ...prev,
          [barang.id]: foundIndex,
        }));
      }
    });
  }, [searchQuery, daftarBarang]);

  const handleSaveProduct = async (productData) => {
    setIsLoading(true);
    try {
      const result = await saveProduct(
        {
          nama: productData.nama,
          kategori: productData.kategori,
          opsi_variasi: productData.opsi_variasi,
        },
        productData.isEditMode,
        productData.editId,
      );

      if (result.success) {
        showToast(productData.isEditMode ? "✨ Produk berhasil diperbarui!" : "✨ Produk baru berhasil ditambahkan!", productData.isEditMode ? "info" : "success");
        setIsOpen(false);
        setSelectedProduct(null);
      } else {
        if (result.error?.type === "DUPLICATE") {
          showToast(`⚠️ ${result.error.message}`, "warning");
        } else {
          throw result.error;
        }
      }
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      showToast("❌ Gagal menyimpan produk: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    const barang = daftarBarang.find((b) => b.id === deleteModal.id);
    const result = await deleteProduct(deleteModal.id, barang?.opsiVariasi || []);

    if (result.success) {
      showToast("🗑️ Produk berhasil dihapus!", "delete");
    } else {
      showToast("❌ Gagal menghapus produk!", "error");
    }

    setDeleteModal({ isOpen: false, id: null, name: "" });
  };

  const handleEditClick = (barang) => {
    setSelectedProduct(barang);
    setIsOpen(true);
  };

  const handleDeleteClick = (id) => {
    const barang = daftarBarang.find((b) => b.id === id);
    if (barang) {
      setDeleteModal({ isOpen: true, id: id, name: barang.nama });
    }
  };

  const handleCheckout = () => {
    showToast("✅ Transaksi berhasil diproses!", "checkout");
    clearCart();
    setShowDetail(false);
  };

  const handleClearCart = () => {
    clearCart();
    setShowDetail(false);
    showToast("🗑️ Keranjang belanja dikosongkan", "clear");
  };

  const handleTambahProdukCepat = () => {
    setSelectedProduct(null);
    setIsOpen(true);
  };

  // Filter produk
  const barangDifilter = [...daftarBarang]
    .sort((a, b) => a.nama.localeCompare(b.nama))
    .filter((b) => {
      const cocokKategori = kategoriAktif === "Semua" || b.kategori === kategoriAktif;

      const searchLower = searchQuery.toLowerCase().trim();
      if (!searchLower) return cocokKategori;

      const namaProdukLower = b.nama.toLowerCase();
      const namaVariasiList = b.opsiVariasi?.map((v) => v.namaVariasi.toLowerCase()) || [];

      const cocokNamaProduk = namaProdukLower.includes(searchLower);
      const cocokNamaVariasi = namaVariasiList.some((v) => v.includes(searchLower));
      const kombinasiNamaTipe = namaVariasiList.map((v) => `${namaProdukLower} ${v}`);
      const cocokKombinasi = kombinasiNamaTipe.some((kombinasi) => kombinasi.includes(searchLower));

      const kataPisah = searchLower.split(" ").filter((kata) => kata.length > 0);
      let cocokSemuaKata = false;
      if (kataPisah.length > 1) {
        cocokSemuaKata = kataPisah.every((kata) => {
          return namaProdukLower.includes(kata) || namaVariasiList.some((v) => v.includes(kata));
        });
      }

      const cocokPencarian = cocokNamaProduk || cocokNamaVariasi || cocokKombinasi || cocokSemuaKata;

      return cocokKategori && cocokPencarian;
    });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] antialiased selection:bg-[#1A73E8] selection:text-white">
      {isLoading && <LoadingOverlay />}
      <ToastNotification message={toastMessage} type={toastType} />

      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <KategoriBar kategoriAktif={kategoriAktif} setKategoriAktif={setKategoriAktif} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-52 sm:pb-44">
        <main>
          <ProductGrid
            products={barangDifilter}
            keranjang={keranjang}
            tambahKuantitas={tambahKuantitas}
            kurangKuantitas={kurangKuantitas}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            variasiTerpilih={variasiTerpilih}
            setVariasiTerpilih={setVariasiTerpilih}
          />
        </main>
      </div>

      <CartFooter
        totalItem={totalItem}
        totalHarga={totalHarga}
        detailProduk={detailProdukTerpilih}
        kurangKuantitas={kurangKuantitas}
        tambahKuantitas={tambahKuantitas}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
        showDetail={showDetail}
        setShowDetail={setShowDetail}
      />

      {totalItem === 0 && (
        <button
          onClick={handleTambahProdukCepat}
          className="fixed bottom-5 right-5 bg-[#1A73E8] text-white w-12 h-12 rounded-full flex items-center justify-center z-40 shadow-lg hover:bg-[#1557B0] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      <ProductForm
        key={isOpen ? "open" : "closed"}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialData={selectedProduct}
        isLoading={isLoading}
      />

      <ConfirmDeleteModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })} onConfirm={handleDeleteProduct} productName={deleteModal.name} />
    </div>
  );
}

export default App;
