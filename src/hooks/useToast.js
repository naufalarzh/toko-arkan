import { useState, useEffect } from "react";

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage("");
        setToastType("success");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  return { toastMessage, toastType, showToast };
};
