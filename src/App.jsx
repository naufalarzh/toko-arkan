import React, { useState } from "react";
import Navbar from "./components/layout/Navbar";
import KategoriBar from "./components/layout/KategoriBar";
import LoadingOverlay from "./components/layout/LoadingOverlay";
import ProductGrid from "./components/product/ProductGrid";
import ProductForm from "./components/product/ProductForm";
import ConfirmDeleteModal from "./components/modals/ConfirmDeleteModal";
import ToastNotification from "./components/modals/ToastNotification";
import { useProducts } from "./hooks/useProducts";
import { useToast } from "./hooks/useToast";
import { uploadGambarKeStorage } from "./utils/imageUpload";
import { DEFAULT_IMAGE } from "./utils/constants";
import noPictures from "./assets/no-pictures.png";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [variasiTerpilih, setVariasiTerpilih] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });

  const { daftarBarang, isLoading, setIsLoading, saveProduct, deleteProduct } = useProducts();
  const { toastMessage, setToastMessage } = useToast();

  const handleSaveProduct = async (productData) => {
    setIsLoading(true);
    try {
      let urlGambarFinal = productData.gambar_url;

      if (productData.fileGambar) {
        setToastMessage("⏳ Mengunggah gambar...");
        urlGambarFinal = await uploadGambarKeStorage(productData.fileGambar, productData.oldImageUrl);
      }

      const dataToSave = {
        nama: productData.nama,
        kategori: productData.kategori,
        gambar_url: urlGambarFinal || null,
        opsi_variasi: productData.opsi_variasi,
      };

      const result = await saveProduct(dataToSave, productData.isEditMode, productData.editId);

      if (result.success) {
        setToastMessage(productData.isEditMode ? "✨ Produk diperbarui!" : "✨ Produk baru ditambahkan!");
        setIsOpen(false);
        setSelectedProduct(null);
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      setToastMessage("❌ Terjadi kesalahan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    const barang = daftarBarang.find((b) => b.id === deleteModal.id);
    const result = await deleteProduct(deleteModal.id, barang?.gambarUrl);

    if (result.success) {
      setToastMessage("✨ Produk berhasil dihapus!");
    } else {
      setToastMessage("❌ Gagal menghapus produk!");
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

  const barangDifilter = [...daftarBarang]
    .sort((a, b) => a.nama.localeCompare(b.nama))
    .filter((b) => {
      const cocokKategori = kategoriAktif === "Semua" || b.kategori === kategoriAktif;
      const cocokPencarian = b.nama.toLowerCase().includes(searchQuery.toLowerCase());
      return cocokKategori && cocokPencarian;
    });

  return (
    <div className="min-h-screen bg-[#0B1329] text-slate-200 antialiased selection:bg-emerald-500 selection:text-white">
      {isLoading && <LoadingOverlay />}
      <ToastNotification message={toastMessage} />

      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <KategoriBar kategoriAktif={kategoriAktif} setKategoriAktif={setKategoriAktif} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <main>
          <ProductGrid products={barangDifilter} onEdit={handleEditClick} onDelete={handleDeleteClick} variasiTerpilih={variasiTerpilih} setVariasiTerpilih={setVariasiTerpilih} />
        </main>
      </div>

      {/* Tombol floating untuk tambah produk */}
      <button
        onClick={() => {
          setSelectedProduct(null);
          setIsOpen(true);
        }}
        className="fixed bottom-5 right-5 bg-emerald-500 text-black w-12 h-12 rounded-2xl flex items-center justify-center z-40 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

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
