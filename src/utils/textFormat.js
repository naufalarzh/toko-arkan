const UNIT_ABBREVIATIONS = new Set(["kg", "ml", "l", "gr", "lt", "rb", "k"]);

const applyTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\S+/g, (word) => {
    const parts = word.split(/(\d+)/);
    return parts
      .map((part) => {
        if (!part) return "";
        if (/^\d+$/.test(part)) return part;
        if (UNIT_ABBREVIATIONS.has(part)) return part.toUpperCase();
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join("");
  });
};

export const toTitleCaseLive = (str) => applyTitleCase(str);
export const toTitleCase = (str) => applyTitleCase(str).trim();
