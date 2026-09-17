import { C } from "../constants/appConstants";

export const uid = () =>
  Math.random().toString(36).slice(2, 10);

export const pad2 = (n) =>
  String(n).padStart(2, "0");

export const todayISO = () => {
  const d = new Date();

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate()
  )}`;
};

export const monthKeyOf = (iso) =>
  iso.slice(0, 7);

export const daysInMonth = (yyyyMM) => {
  const [y, m] = yyyyMM.split("-").map(Number);

  return new Date(y, m, 0).getDate();
};

export const monthLabel = (yyyyMM) => {
  const [y, m] = yyyyMM.split("-").map(Number);

  return new Date(y, m - 1, 1).toLocaleDateString(
    "id-ID",
    {
      month: "long",
      year: "numeric",
    }
  );
};

export const clampInt = (raw) => {
  const digits = String(raw).replace(/[^0-9]/g, "");

  if (digits === "") return "";

  return String(parseInt(digits, 10));
};

export const qtyStd = (menit, ct) => {
  const m = Number(menit) || 0;

  if (!ct || !m) return 0;

  return Math.round((m * 60) / ct);
};

export const pctAct = (pcs, qs) => {
  const p = Number(pcs) || 0;

  if (!qs) return null;

  return (p / qs) * 100;
};

export const statusColor = (pct) => {
  if (pct === null) return C.muted;

  if (pct >= 100) return C.good;

  if (pct >= 85) return C.warn;

  return C.bad;
};
