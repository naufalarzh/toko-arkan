import React from "react";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-[#0F0A1A]/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-[#1A1128] rounded-2xl p-6 flex flex-col items-center gap-3 border border-amber-500/20">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-300">Memproses...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
