import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { uploadImage, deleteImage } from "../../utils/imageUpload";
import { resolveImage, handleImageError, DEFAULT_IMAGE } from "../../utils/resolveImage";

const emptyVariant = () => ({
  typeName: "",
  price: "",
  image: "",
});

const emptyProduct = () => ({
  name: "",
  category: "sembako",
  variants: [emptyVariant()],
});

const CATEGORY_OPTIONS = [
  { id: "sembako", label: "Sembako", icon: "🍚" },
  { id: "rokok", label: "Rokok", icon: "🚬" },
  { id: "alat-tulis", label: "Alat Tulis", icon: "✏️" },
  { id: "listrik", label: "Listrik", icon: "⚡" },
  { id: "lainnya", label: "Lainnya", icon: "📦" },
];

// Cek apakah path perlu dihapus dari storage (bukan default & bukan URL eksternal)
const isStoragePath = (p) => p && !p.startsWith("http") && !p.startsWith("data:") && p !== DEFAULT_IMAGE;

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useProducts();

  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState({});
  const [urlInputVisible, setUrlInputVisible] = useState({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef(null);
  const variantRefs = useRef([]);

  // Load data kalau edit
  useEffect(() => {
    if (isEdit) {
      const existing = products.find((p) => p.id === Number(id));
      if (existing) {
        setForm({
          name: existing.name,
          category: existing.category,
          variants: existing.variants.map((v) => ({
            typeName: v.typeName,
            price: v.price,
            image: v.image || "",
          })),
        });
      } else {
        navigate("/admin/products");
      }
    }
  }, [id, isEdit, products, navigate]);

  // ===== FIELD HANDLERS =====
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateVariant = (idx, field, value) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      let processedValue = value;

      if (field === "price") {
        const numeric = value.replace(/[^0-9]/g, "");
        processedValue = numeric ? "Rp " + parseInt(numeric, 10).toLocaleString("id-ID") : "";
      }

      variants[idx] = { ...variants[idx], [field]: processedValue };
      return { ...prev, variants };
    });
    setErrors((prev) => ({ ...prev, [`v_${idx}_${field}`]: undefined }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant()],
    }));
    setTimeout(() => {
      variantRefs.current[form.variants.length]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const removeVariant = (idx) => {
    if (form.variants.length <= 1) return;
    const oldPath = form.variants[idx].image;
    if (isStoragePath(oldPath)) {
      deleteImage(oldPath).catch(() => {});
    }
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const moveVariant = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= form.variants.length) return;
    setForm((prev) => {
      const variants = [...prev.variants];
      [variants[idx], variants[newIdx]] = [variants[newIdx], variants[idx]];
      return { ...prev, variants };
    });
  };

  // ===== IMAGE HANDLERS =====
  const handleFileUpload = async (idx, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, [`v_${idx}_image`]: "File harus berupa gambar" }));
      return;
    }

    setUploading((prev) => ({ ...prev, [idx]: true }));
    setErrors((prev) => ({ ...prev, [`v_${idx}_image`]: undefined }));

    try {
      const oldPath = form.variants[idx].image;
      const newPath = await uploadImage(file);

      if (isStoragePath(oldPath)) {
        deleteImage(oldPath).catch(() => {});
      }

      updateVariant(idx, "image", newPath);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [`v_${idx}_image`]: "Gagal upload: " + (err.message || "Coba lagi"),
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const handlePaste = async (idx) => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted.png", { type: imageType });
          await handleFileUpload(idx, file);
          return;
        }
      }
      setErrors((prev) => ({
        ...prev,
        [`v_${idx}_image`]: "Tidak ada gambar di clipboard",
      }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [`v_${idx}_image`]: "Gagal paste. Pakai tombol Upload atau URL saja.",
      }));
    }
  };

  const handleRemoveImage = (idx) => {
    const oldPath = form.variants[idx].image;
    if (isStoragePath(oldPath)) {
      deleteImage(oldPath).catch(() => {});
    }
    updateVariant(idx, "image", "");
  };

  // ===== VALIDATION =====
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama produk wajib diisi";

    form.variants.forEach((v, i) => {
      if (!v.typeName.trim()) errs[`v_${i}_typeName`] = "Nama varian wajib diisi";
      if (!v.price.trim() || v.price === "Rp 0") errs[`v_${i}_price`] = "Harga wajib diisi";
    });

    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setShowErrorBanner(true);
      setTimeout(() => setShowErrorBanner(false), 5000);

      if (errs.name) {
        nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        nameRef.current?.focus();
      } else {
        for (let i = 0; i < form.variants.length; i++) {
          if (errs[`v_${i}_typeName`] || errs[`v_${i}_price`]) {
            variantRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
            break;
          }
        }
      }
      return;
    }

    if (Object.values(uploading).some(Boolean)) {
      setShowErrorBanner(true);
      setTimeout(() => setShowErrorBanner(false), 5000);
      return;
    }

    const normalizePrice = (p) => {
      const num = p.replace(/[^0-9]/g, "");
      return "Rp " + (parseInt(num, 10) || 0).toLocaleString("id-ID");
    };

    const payload = {
      name: form.name.trim(),
      category: form.category,
      variants: form.variants.map((v) => ({
        typeName: v.typeName.trim(),
        price: normalizePrice(v.price),
        image: v.image.trim() || DEFAULT_IMAGE,
      })),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateProduct(Number(id), payload);
      } else {
        await addProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setShowErrorBanner(true);
      setTimeout(() => setShowErrorBanner(false), 5000);
      setSubmitting(false);
    }
  };

  const errorCount = Object.keys(errors).length;

  // ===== RENDER =====
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-2xl p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-5">
          <Link to="/admin/products" className="hover:text-indigo-600">
            Produk
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{isEdit ? "Edit" : "Tambah Baru"}</span>
        </div>

        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">{isEdit ? "Edit Produk" : "Tambah Produk"}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Setiap tipe bisa punya gambar sendiri</p>
        </div>

        {/* Banner Error */}
        {showErrorBanner && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 flex items-start gap-3 animate-toast-in">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">!</div>
            <div className="flex-1">
              <p className="font-bold text-rose-700 dark:text-rose-300 text-sm mb-0.5">{errorCount > 0 ? `Ada ${errorCount} field yang belum diisi` : "Terjadi kesalahan saat menyimpan"}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400">Periksa field yang ditandai atau coba lagi.</p>
            </div>
            <button onClick={() => setShowErrorBanner(false)} className="text-rose-500 hover:text-rose-700 font-bold">
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ===== NAMA BARANG ===== */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nama Barang *</label>
            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Contoh: Indomie"
              className={`w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.name ? "border-rose-400 dark:border-rose-600 ring-1 ring-rose-300" : "border-slate-200 dark:border-slate-700"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500 font-semibold">⚠️ {errors.name}</p>}
          </div>

          {/* ===== KATEGORI ===== */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = form.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateField("category", cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===== VARIAN ===== */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipe / Variasi *</label>
              <p className="text-xs text-slate-400 mt-0.5">{form.variants.length} varian terdaftar</p>
            </div>

            <div className="space-y-3">
              {form.variants.map((variant, idx) => (
                <VariantCard
                  key={idx}
                  idx={idx}
                  variant={variant}
                  errors={errors}
                  total={form.variants.length}
                  isUploading={!!uploading[idx]}
                  onUpdate={updateVariant}
                  onRemove={removeVariant}
                  onMove={moveVariant}
                  onUpload={handleFileUpload}
                  onPaste={handlePaste}
                  onRemoveImage={handleRemoveImage}
                  urlInputVisible={urlInputVisible}
                  setUrlInputVisible={setUrlInputVisible}
                  cardRef={(el) => (variantRefs.current[idx] = el)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold py-2.5 rounded-2xl transition-all active:scale-[0.98] text-sm"
            >
              <span className="text-base">➕</span> Tambah Tipe / Varian
            </button>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2 pb-6">
            <Link
              to="/admin/products"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white transition shadow-lg shadow-indigo-500/30 ${
                submitting
                  ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98]"
              }`}
            >
              {submitting ? "⏳ Menyimpan..." : isEdit ? "💾 Simpan Perubahan" : "✨ Simpan Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// KOMPONEN VARIANT CARD
// ============================================================
function VariantCard({ idx, variant, errors, total, isUploading, onUpdate, onRemove, onMove, onUpload, onPaste, onRemoveImage, urlInputVisible, setUrlInputVisible, cardRef }) {
  const fileInputRef = useRef(null);
  const showUrl = urlInputVisible[idx] || false;

  const toggleUrl = () => {
    setUrlInputVisible((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const hasError = errors[`v_${idx}_typeName`] || errors[`v_${idx}_price`];

  const previewSrc = resolveImage(variant.image, 200);

  return (
    <div
      ref={cardRef}
      className={`p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border transition-all ${
        hasError ? "border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20" : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Header Varian */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => onMove(idx, -1)}
              disabled={idx === 0}
              className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] transition leading-none"
              title="Naikkan"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => onMove(idx, 1)}
              disabled={idx === total - 1}
              className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] transition leading-none"
              title="Turunkan"
            >
              ▼
            </button>
          </div>
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tipe {idx + 1}</span>
          {hasError && <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">⚠️ Perlu diperbaiki</span>}
        </div>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          disabled={total <= 1}
          className={`text-xs font-bold transition flex items-center gap-1 ${total <= 1 ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "text-rose-500 hover:text-rose-700"}`}
          title={total <= 1 ? "Minimal 1 varian" : "Hapus varian"}
        >
          🗑️ Hapus
        </button>
      </div>

      {/* Nama Varian & Harga */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        <div>
          <input
            type="text"
            value={variant.typeName}
            onChange={(e) => onUpdate(idx, "typeName", e.target.value)}
            placeholder="Tipe (contoh: 1 Bungkus)"
            className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors[`v_${idx}_typeName`] ? "border-rose-400 ring-1 ring-rose-300" : "border-slate-200 dark:border-slate-700"
            }`}
          />
          {errors[`v_${idx}_typeName`] && <p className="mt-1 text-[11px] text-rose-500 font-semibold">⚠️ {errors[`v_${idx}_typeName`]}</p>}
        </div>
        <div>
          <input
            type="text"
            inputMode="numeric"
            value={variant.price}
            onChange={(e) => onUpdate(idx, "price", e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Rp 0"
            className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors[`v_${idx}_price`] ? "border-rose-400 ring-1 ring-rose-300" : "border-slate-200 dark:border-slate-700"
            }`}
          />
          {errors[`v_${idx}_price`] && <p className="mt-1 text-[11px] text-rose-500 font-semibold">⚠️ {errors[`v_${idx}_price`]}</p>}
        </div>
      </div>

      {/* Gambar Section */}
      <div className="mt-3">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Gambar untuk tipe ini <span className="text-slate-400 normal-case font-normal">(opsional)</span>
        </p>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "⏳" : "📁 Upload"}
          </button>
          <button
            type="button"
            onClick={() => onPaste(idx)}
            disabled={isUploading}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📋 Paste
          </button>
          <button
            type="button"
            onClick={toggleUrl}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg border text-[11px] font-bold transition ${
              showUrl
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700"
            }`}
          >
            🔗 URL
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(idx, file);
            e.target.value = "";
          }}
          className="hidden"
        />

        {showUrl && (
          <div className="mt-2">
            <input
              type="text"
              value={variant.image}
              onChange={(e) => onUpdate(idx, "image", e.target.value)}
              placeholder="https://example.com/gambar.jpg"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        )}

        <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">💡 Kosongkan saja kalau tidak ada gambar</p>

        {errors[`v_${idx}_image`] && <p className="mt-1 text-[11px] text-rose-500 font-semibold">⚠️ {errors[`v_${idx}_image`]}</p>}

        {/* Preview — diperkecil */}
        <div className="mt-2.5 flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <img src={previewSrc} alt="preview" className="w-12 h-12 rounded-md object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0" onError={handleImageError} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Preview</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              {!variant.image || variant.image === DEFAULT_IMAGE
                ? "🖼️ Default (noimage.png)"
                : variant.image.startsWith("data:")
                  ? "🖼️ File upload (lama)"
                  : variant.image.startsWith("http")
                    ? variant.image
                    : "☁️ Supabase"}
            </p>
          </div>
          {variant.image && variant.image !== DEFAULT_IMAGE && (
            <button type="button" onClick={() => onRemoveImage(idx)} className="text-xs font-bold text-rose-500 hover:text-rose-700 transition px-1.5" title="Hapus gambar">
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
