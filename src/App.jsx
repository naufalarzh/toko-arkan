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

  // ========== SCROLL KE ATAS SAAT KATEGORI BERUBAH ==========
  useEffect(() => {
    // Scroll ke atas dengan efek smooth
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [kategoriAktif]); // Jalankan setiap kali kategori berubah
  // =========================================================

  // ========== SCROLL KE ATAS SAAT SEARCH BERUBAH ==========
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [searchQuery]); // Jalankan setiap kali search berubah
  // =======================================================

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
        throw result.error;
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

      const searchLower = searchQuery.toLowerCase();
      const cocokNamaProduk = b.nama.toLowerCase().includes(searchLower);
      const cocokNamaVariasi = b.opsiVariasi?.some((variasi) => variasi.namaVariasi.toLowerCase().includes(searchLower));
      const cocokPencarian = cocokNamaProduk || cocokNamaVariasi;

      return cocokKategori && cocokPencarian;
    });

  return (
    <div className="min-h-screen bg-[#0F0A1A] text-slate-200 antialiased selection:bg-amber-500 selection:text-white">
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
          className="fixed bottom-5 right-5 bg-amber-500 text-[#0F0A1A] w-12 h-12 rounded-2xl flex items-center justify-center z-40 shadow-lg hover:bg-amber-400 transition"
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
