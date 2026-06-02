import React from "react";

const ToastNotification = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-emerald-500 text-[#0B1329] px-6 py-3 rounded-xl font-bold text-center text-xs sm:text-sm shadow-2xl z-50 transition-all duration-300">
      ✨ {message}
    </div>
  );
};

export default ToastNotification;
