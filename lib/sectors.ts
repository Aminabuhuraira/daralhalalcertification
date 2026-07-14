export const SCHEME_CODES = [
  { code: "FB", label: "Food and Beverages" },
  { code: "FP", label: "Food Premises" },
  { code: "AQ", label: "Aquatic Animals and Fish Processing" },
  { code: "SL", label: "Slaughterhouse / Meat and Poultry" },
  { code: "CS", label: "Cosmetics and Personal Care" },
  { code: "PH", label: "Pharmaceuticals and Supplements" },
  { code: "CG", label: "Consumer Goods" },
  { code: "LG", label: "Logistics and Supply Chain" },
] as const;

export type SchemeCode = typeof SCHEME_CODES[number]["code"];

export const CERTIFICATION_SECTORS = SCHEME_CODES.map(s => s.label);
