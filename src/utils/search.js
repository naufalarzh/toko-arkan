export const normalizeQuery = (str) => {
  return str
    .toLowerCase()
    .replace(/(\d+)\s*(l|liter|lt)\b/g, "$1 liter")
    .replace(/(\d+)\s*(ml|mili)\b/g, "$1 ml")
    .replace(/(\d+)\s*(kg|kilo|kilogram)\b/g, "$1 kg")
    .replace(/(\d+)\s*(gr|gram|g)\b/g, "$1 gram")
    .replace(/(\d+)\s*(k|rb|ribu)\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
};

export const smartSearch = (products, query) => {
  const trimmed = normalizeQuery(query);
  if (!trimmed) {
    return products.map((p) => ({ product: p, matchedVariantIndex: null }));
  }

  const keywords = trimmed.split(/\s+/).filter(Boolean);
  const results = [];

  products.forEach((product) => {
    const productName = product.name.toLowerCase();
    let bestVariantIndex = null;

    product.variants.forEach((variant, idx) => {
      const variantName = variant.typeName.toLowerCase();
      const combined = `${productName} ${variantName}`;
      const allMatch = keywords.every((kw) => combined.includes(kw));
      if (allMatch && bestVariantIndex === null) {
        bestVariantIndex = idx;
      }
    });

    if (bestVariantIndex !== null) {
      results.push({ product, matchedVariantIndex: bestVariantIndex });
    } else {
      const allMatchOnName = keywords.every((kw) => productName.includes(kw));
      if (allMatchOnName) {
        results.push({ product, matchedVariantIndex: null });
      }
    }
  });

  return results;
};
