import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const LIMIT = 15;

const TX_TYPES = ["", "DEPOSIT", "WITHDRAW", "TRANSFER"];

export function useHistoryPage() {
  const { showToast } = useToast();
  const [accountId, setAccountId] = useState(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: {} });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [rangePreset, setRangePreset] = useState("all");

  const load = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await api(
        `/api/transactions/history/${accountId}?page=${page}&limit=${LIMIT}`
      );
      setData(res.data);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [accountId, page, showToast]);

  useEffect(() => {
    api("/api/accounts/me")
      .then((r) => setAccountId(r.data.account.id))
      .catch((e) => showToast(e.message, "error"))
      .finally(() => setReady(true));
  }, [showToast]);

  useEffect(() => {
    if (accountId) load();
  }, [accountId, load]);

  const filteredItems = useMemo(() => {
    let list = [...(data.items || [])];
    const now = Date.now();
    if (rangePreset === "7d") {
      const cut = now - 7 * 86400000;
      list = list.filter((t) => t.createdAt && new Date(t.createdAt).getTime() >= cut);
    } else if (rangePreset === "30d") {
      const cut = now - 30 * 86400000;
      list = list.filter((t) => t.createdAt && new Date(t.createdAt).getTime() >= cut);
    }
    if (typeFilter) list = list.filter((t) => t.type === typeFilter);
    return list;
  }, [data.items, typeFilter, rangePreset]);

  const statementSummary = useMemo(() => {
    let depC = 0;
    let witC = 0;
    for (const t of filteredItems) {
      const c = typeof t.amountCents === "number" ? t.amountCents : 0;
      if (t.type === "DEPOSIT") depC += c;
      if (t.type === "WITHDRAW") witC += c;
    }
    const fmt = (c) => (c / 100).toFixed(2);
    return { deposits: fmt(depC), withdrawals: fmt(witC) };
  }, [filteredItems]);

  const columns = useMemo(
    () => [
      { key: "type", label: "Type" },
      { key: "direction", label: "Direction" },
      { key: "amount", label: "Amount" },
      { key: "description", label: "Note" },
      { key: "createdAt", label: "When" },
    ],
    []
  );

  const rows = useMemo(
    () =>
      filteredItems.map((t) => ({
        id: t.id,
        type: t.type,
        direction: t.direction,
        amount: `₹${t.amount}`,
        description: t.description || "—",
        createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "—",
      })),
    [filteredItems]
  );

  const pg = data.pagination || {};

  return {
    ready,
    loading,
    page,
    setPage,
    columns,
    rows,
    pg,
    load,
    typeFilter,
    setTypeFilter,
    rangePreset,
    setRangePreset,
    statementSummary,
    txTypeOptions: TX_TYPES,
    filterHint: "Filters apply to the current page of results.",
  };
}
