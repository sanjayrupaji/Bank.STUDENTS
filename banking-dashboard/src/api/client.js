const VITE_URL = import.meta.env.VITE_API_URL || "";
// Strip trailing /api if present to avoid doubling with the paths that already include it
const BASE = VITE_URL.replace(/\/api\/?$/, "");

export async function api(path, options = {}) {
  const token = localStorage.getItem("bank_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json.message || res.statusText || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json.data;
    throw err;
  }
  return json;
}

export function setToken(t) {
  if (t) localStorage.setItem("bank_token", t);
  else localStorage.removeItem("bank_token");
}
