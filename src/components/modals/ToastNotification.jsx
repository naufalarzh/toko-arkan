import React from "react";

const ToastNotification = ({ message, type = "success" }) => {
  if (!message) return null;

  const getColorStyles = () => {
    switch (type) {
      case "success":
        return "bg-amber-500 text-[#0F0A1A]";
      case "error":
        return "bg-rose-500 text-white";
      case "info":
        return "bg-sky-500 text-white";
      case "warning":
        return "bg-orange-500 text-[#0F0A1A]";
      case "delete":
        return "bg-rose-600 text-white";
      case "clear":
        return "bg-red-500 text-white";
      case "checkout":
        return "bg-emerald-500 text-[#0F0A1A]";
      default:
        return "bg-amber-500 text-[#0F0A1A]";
    }
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 px-6 py-3 rounded-xl font-bold text-center text-xs sm:text-sm shadow-2xl z-[999] transition-all duration-300 ${getColorStyles()}`}
    >
      {message}
    </div>
  );
};

export default ToastNotification;
