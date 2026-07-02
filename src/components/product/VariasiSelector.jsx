import React from "react";

const VariasiSelector = ({ opsiVariasi, selectedIndex, onSelect }) => {
  if (opsiVariasi.length <= 1) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-[#DADCE0]">
      {opsiVariasi.map((v, index) => (
        <button
          key={v.namaVariasi}
          onClick={() => onSelect(index)}
          className={`flex-1 text-[10px] font-bold py-1.5 px-1 rounded-lg text-center transition whitespace-nowrap ${
            selectedIndex === index ? "bg-[#1A73E8] text-white" : "text-[#5F6368] hover:text-[#202124] hover:bg-white"
          }`}
        >
          {v.namaVariasi}
        </button>
      ))}
    </div>
  );
};

export default VariasiSelector;
