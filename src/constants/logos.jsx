import React from "react";
import logoDana from "../assets/dana.png";
import logoOvo from "../assets/ovo.png";
import logoShopeePay from "../assets/shopeepay.png";
import logoGoPay from "../assets/gopay.png";
import logoFreeFire from "../assets/freefire.png";
import logoToken from "../assets/token.png";

export const Logos = {
  dana: <img src={logoDana} alt="Dana" className="w-5 h-5 object-contain" />,
  ovo: <img src={logoOvo} alt="OVO" className="w-5 h-5 object-contain" />,
  shopeepay: <img src={logoShopeePay} alt="ShopeePay" className="w-5 h-5 object-contain" />,
  gopay: <img src={logoGoPay} alt="GoPay" className="w-5 h-5 object-contain" />,
  freefire: <img src={logoFreeFire} alt="Free Fire" className="w-5 h-5 object-contain" />,
  pulsa: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <rect width="24" height="24" rx="6" fill="#10B981" />
      <rect x="7" y="5" width="10" height="14" rx="2" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="16" r="1" fill="white" />
    </svg>
  ),
  token: <img src={logoToken} alt="Token Listrik" className="w-5 h-5 object-contain" />,
};
