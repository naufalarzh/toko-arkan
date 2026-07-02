import React from "react";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 border border-[#DADCE0] shadow-lg">
        <div className="w-8 h-8 border-4 border-[#1A73E8] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-[#5F6368]">Memproses...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
