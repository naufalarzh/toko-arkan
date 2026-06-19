import React from "react";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F0A1A]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#1A1128] rounded-2xl border border-amber-500/20 p-6 w-full max-w-sm shadow-2xl relative text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-base font-bold text-white mb-2">Hapus Produk?</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Apakah Anda yakin ingin menghapus <span className="text-rose-400 font-semibold">"{productName}"</span> dari katalog Toko Arkan? Data akan hilang permanen.
        </p>

        <div className="flex space-x-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-[#0F0A1A] hover:bg-[#0F0A1A]/60 text-slate-300 text-xs font-bold rounded-xl transition">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg transition">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
