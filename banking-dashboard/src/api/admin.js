import { api } from "./client.js";

const VITE_URL = import.meta.env.VITE_API_URL || "";
// Strip trailing /api if present to avoid doubling with path constants
const BASE = VITE_URL.replace(/\/api\/?$/, "");

export function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function fetchKpis() {
  return api("/api/admin/analytics/kpis");
}

export function fetchVolume(preset, from, to) {
  return api(`/api/admin/analytics/volume${qs({ preset, from, to })}`);
}

export function fetchFlows(preset, from, to) {
  return api(`/api/admin/analytics/flows${qs({ preset, from, to })}`);
}

export function fetchGrowth(preset, from, to) {
  return api(`/api/admin/analytics/growth${qs({ preset, from, to })}`);
}

export function fetchActivity(limit = 40) {
  return api(`/api/admin/activity${qs({ limit })}`);
}

export function fetchSystem() {
  return api("/api/admin/system");
}

export function fetchAdminUsers(params) {
  return api(`/api/admin/users${qs(params)}`);
}

export function fetchAdminAccounts(params) {
  return api(`/api/admin/accounts${qs(params)}`);
}

export function fetchAdminTransactions(params) {
  return api(`/api/admin/transactions${qs(params)}`);
}

export async function fetchHealth() {
  const res = await fetch(`${BASE}/api/health`);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export async function downloadTransactionsCsv(params) {
  const token = localStorage.getItem("bank_token");
  const query = qs(params);
  const res = await fetch(`${BASE}/api/admin/export/transactions${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = new Error("Export failed");
    err.status = res.status;
    throw err;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}
