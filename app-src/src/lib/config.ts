// Public, browser-safe settings. The Supabase publishable key and the Web3Forms
// access key are designed to be public (row-level security / key-locked inbox).
export const CONFIG = {
  // PIHOCO's own Supabase project (no Lovable dependency).
  supabaseUrl: "https://appccwwupxkfzzuawzzr.supabase.co",
  supabaseKey: "sb_publishable_QhuV3Qj4cbQpjDWorB84FQ_kY4roZeO",
  // Same Web3Forms key as the pihoco site (assets/js/config.js): every lead is emailed.
  web3formsKey: "7b083011-54a9-4b02-805a-05c1f4c111e7",
  siteUrl: "/",
  contactEmail: "contact@pihoco.com",
  auditPrice: "USD 750",
};

export const COUNTRIES = [
  { label: "UAE", code: "AE", currency: "AED" },
  { label: "UK", code: "GB", currency: "GBP" },
  { label: "US", code: "US", currency: "USD" },
  { label: "India", code: "IN", currency: "INR" },
  { label: "Singapore", code: "SG", currency: "SGD" },
] as const;

export const CONCEPTS = [
  { label: "Restaurant", value: "restaurant" },
  { label: "Café", value: "cafe" },
  { label: "Bar", value: "bar" },
  { label: "Cloud kitchen", value: "cloud_kitchen" },
  { label: "QSR", value: "qsr" },
] as const;
