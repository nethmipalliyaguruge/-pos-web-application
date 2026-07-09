// Small shared formatting helpers so currency/date look the same everywhere
// (and so we don't repeat `.toFixed(2)` or the date options in every page).

// Money → "Rs. 1234.50". Guards against null/undefined/NaN so a missing
// value shows "Rs. 0.00" instead of crashing on .toFixed.
export const formatCurrency = (n) => `Rs. ${Number(n || 0).toFixed(2)}`;

// ISO date string → "09 Jul 2026, 14:30" (readable, 24h).
export const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });