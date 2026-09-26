import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import CategoryTabs from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";
import CheckoutModal from "../components/CheckoutModal";
import ReceiptModal from "../components/ReceiptModal";
import Toast from "../components/Toast";
import Footer from "../components/Footer";

import { useProducts } from "../context/ProductContext";
import { smartSearch } from "../utils/search";
import { parsePrice } from "../utils/helpers";
import { printReceipt } from "../utils/printReceipt";

export default function UserPage() {
  const { products } = useProducts();

  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [activeVariants, setActiveVariants] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
  });

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState(null);

  // ===== STATE CHECKOUT =====
  const [showCheckout, setShowCheckout] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [receipt, setReceipt] = useState(null);

  // Dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Auto dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ===== HANDLERS =====
  const handleVariantChange = (productId, variantIndex) => {
    setActiveVariants((prev) => ({ ...prev, [productId]: variantIndex }));
  };

  const addToCart = (product) => {
    const activeIndex = activeVariants[product.id] || 0;
    const variant = product.variants[activeIndex];
    const priceNumber = parsePrice(variant.price);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.productId === product.id && item.variantName === variant.typeName);

      if (existingIndex !== -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          variantName: variant.typeName,
          price: variant.price,
          priceNumber,
          image: variant.image,
          qty: 1,
        },
      ];
    });

    setToast({
      name: product.name,
      variantName: variant.typeName,
    });
  };

  const removeFromCart = (productId, variantName) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.variantName === variantName)));
  };

  const updateQty = (productId, variantName, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.variantName === variantName) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const clearCart = () => setCart([]);

  // ===== COMPUTED =====
  const totalPrice = cart.reduce((sum, item) => sum + item.priceNumber * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const productsInCategory = products.filter((product) => selectedCategory === "all" || product.category === selectedCategory);

  const searchResults = smartSearch(productsInCategory, searchQuery);
  const filteredProducts = searchResults.map((r) => r.product);
  const matchedVariantMap = Object.fromEntries(searchResults.filter((r) => r.matchedVariantIndex !== null).map((r) => [r.product.id, r.matchedVariantIndex]));

  const isSearching = searchQuery.trim().length > 0;

  // Sync active variant saat user search
  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (Object.keys(matchedVariantMap).length === 0) return;

    setActiveVariants((prev) => {
      const updated = { ...prev };
      let changed = false;
      Object.entries(matchedVariantMap).forEach(([productId, variantIndex]) => {
        const id = Number(productId);
        if (updated[id] !== variantIndex) {
          updated[id] = variantIndex;
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory]);

  // ===== CHECKOUT LOGIC =====
  const cashNumber = parseInt(cashInput.replace(/[^0-9]/g, ""), 10) || 0;
  const change = cashNumber - totalPrice;
  const isCashEnough = cashNumber >= totalPrice && totalPrice > 0;

  const openCheckout = () => {
    setCashInput("");
    setShowCheckout(true);
  };

  const confirmCheckout = () => {
    if (!isCashEnough) return;

    setReceipt({
      items: [...cart],
      total: totalPrice,
      cash: cashNumber,
      change: change,
      date: new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      invoiceNo: "INV-" + Date.now().toString().slice(-8),
    });

    setCart([]);
    setCashInput("");
    setShowCheckout(false);
    setShowCart(false);
  };

  const handlePrintReceipt = () => printReceipt(receipt);

  // ===== RENDER =====
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalItems={totalItems}
        totalPrice={totalPrice}
        onOpenCart={() => setShowCart(true)}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ✅ Banner & CategoryTabs hanya tampil kalau TIDAK sedang search */}
        {!isSearching && (
          <>
            <Banner />
            <CategoryTabs selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          </>
        )}

        {/* ✅ Info pencarian saat search aktif */}
        {isSearching && (
          <div className="mb-5 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Hasil pencarian untuk <span className="font-bold text-indigo-600 dark:text-indigo-400">"{searchQuery}"</span>
              <span className="ml-1.5 text-xs">({filteredProducts.length} produk)</span>
            </div>
            <button onClick={() => setSearchQuery("")} className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30">
              ✕ Hapus pencarian
            </button>
          </div>
        )}

        <ProductGrid
          products={filteredProducts}
          activeVariants={activeVariants}
          matchedVariantMap={matchedVariantMap}
          searchQuery={searchQuery}
          onVariantChange={handleVariantChange}
          onAddToCart={addToCart}
        />
      </main>

      <CartPanel
        show={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onClearCart={clearCart}
        onCheckout={openCheckout}
      />

      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        totalPrice={totalPrice}
        totalItems={totalItems}
        cashInput={cashInput}
        setCashInput={setCashInput}
        cashNumber={cashNumber}
        change={change}
        isCashEnough={isCashEnough}
        onConfirm={confirmCheckout}
      />

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} onPrint={handlePrintReceipt} />

      <Toast toast={toast} />

      <Footer />
    </div>
  );
}
