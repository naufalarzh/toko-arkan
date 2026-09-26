import React from "react";
import { Logos } from "../constants/logos";

const LogoBadge = ({ logo, label }) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl">
    {logo}
    <span className="text-xs font-semibold">{label}</span>
  </div>
);

export default function Banner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-10 mb-8 shadow-xl text-white">
      <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 select-none pointer-events-none">💳</div>

      <div className="relative z-10 max-w-3xl">
        <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">Layanan Digital</span>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">Top Up E-Wallet, Game dan Pulsa</h2>
        <p className="text-indigo-100 text-sm sm:text-base leading-relaxed mb-5">
          Toko Arkan melayani pengisian saldo e-wallet (Dana, OVO, ShopeePay, GoPay), Top Up Game (Free Fire, Mobile Legends, PUBG), Pulsa All Operator, serta Token Listrik PLN.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <LogoBadge logo={Logos.dana} label="Dana" />
          <LogoBadge logo={Logos.ovo} label="OVO" />
          <LogoBadge logo={Logos.shopeepay} label="ShopeePay" />
          <LogoBadge logo={Logos.gopay} label="GoPay" />
          <LogoBadge logo={Logos.freefire} label="Free Fire" />
          <LogoBadge logo={Logos.pulsa} label="Pulsa" />
          <LogoBadge logo={Logos.token} label="Token Listrik" />
        </div>
      </div>
    </div>
  );
}
