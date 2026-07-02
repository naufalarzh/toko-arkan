import React from "react";

const ToastNotification = ({ message, type = "success" }) => {
  if (!message) return null;

  const getColorStyles = () => {
    switch (type) {
      case "success":
        return "bg-[#34A853] text-white";
      case "error":
        return "bg-[#D93025] text-white";
      case "info":
        return "bg-[#1A73E8] text-white";
      case "warning":
        return "bg-[#F9AB00] text-[#202124]";
      case "delete":
        return "bg-[#D93025] text-white";
      case "clear":
        return "bg-[#D93025] text-white";
      case "checkout":
        return "bg-[#34A853] text-white";
      default:
        return "bg-[#34A853] text-white";
    }
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 px-6 py-3 rounded-xl font-bold text-center text-xs sm:text-sm shadow-lg z-[999] transition-all duration-300 ${getColorStyles()}`}
    >
      {message}
    </div>
  );
};

export default ToastNotification;
