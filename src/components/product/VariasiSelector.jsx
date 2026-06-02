import React from "react";

const VariasiSelector = ({ opsiVariasi, selectedIndex, onSelect }) => {
  if (opsiVariasi.length <= 1) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1 bg-[#0B1329] p-1 rounded-xl border border-slate-800">
      {opsiVariasi.map((v, index) => (
        <button
          key={v.namaVariasi}
          onClick={() => onSelect(index)}
          className={`flex-1 text-[10px] font-bold py-1.5 px-1 rounded-lg text-center transition whitespace-nowrap ${
            selectedIndex === index ? "bg-emerald-500 text-[#0B1329] shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          {v.namaVariasi}
        </button>
      ))}
    </div>
  );
};

export default VariasiSelector;
