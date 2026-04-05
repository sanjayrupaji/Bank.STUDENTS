import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { playSuccessChime } from "../utils/playSuccessChime.js";

export function useDashboardPage() {
  const { showToast } = useToast();
  const { socket } = useSocket();
  const [account, setAccount] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [phase, setPhase] = useState("form");
  const [result, setResult] = useState(null);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const prevFirstId = useRef(null);
  const [flashTxId, setFlashTxId] = useState(null);

  const load = useCallback(
    async (opts = {}) => {
      const silent = Boolean(opts.silent);
      if (!silent) setLoading(true);
      try {
        const accRes = await api("/api/accounts/me");
        const a = accRes.data.account;
        setAccount(a);
        const txRes = await api(`/api/transactions/history/${a.id}?limit=8`);
        setRecent(txRes.data.items || []);
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket || !account?.id) return;
    const onBalance = (payload) => {
      if (payload?.accountId !== account.id) return;
      setAccount((prev) => (prev ? { ...prev, balance: payload.balance } : prev));
      load({ silent: true });
    };
    socket.on("account:update", onBalance);
    return () => socket.off("account:update", onBalance);
  }, [socket, account?.id, load]);

  useEffect(() => {
    const id = recent[0]?.id;
    if (id && prevFirstId.current && id !== prevFirstId.current) {
      setFlashTxId(id);
      const t = setTimeout(() => setFlashTxId(null), 900);
      return () => clearTimeout(t);
    }
    prevFirstId.current = id;
  }, [recent]);

  useEffect(() => {
    if (modal) {
      setPhase("form");
      setResult(null);
    }
  }, [modal]);

  const closeModal = useCallback(() => {
    setModal(null);
    setPhase("form");
    setResult(null);
    setAmount("");
    setDesc("");
  }, []);

  const goReview = useCallback(() => {
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    setPhase("confirm");
  }, [amount, showToast]);

  const backToForm = useCallback(() => setPhase("form"), []);

  const confirmSubmit = useCallback(async () => {
    if (!account || !modal) return;
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    setBusy(true);
    try {
      const body = {
        accountId: account.id,
        amount: amt,
        description: desc.trim() || undefined,
      };
      const path =
        modal === "deposit" ? "/api/transactions/deposit" : "/api/transactions/withdraw";
      const res = await api(path, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      setResult(res.data);
      setPhase("success");
      playSuccessChime();
      load({ silent: true });
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }, [account, modal, amount, desc, showToast, load]);

  const rows = recent.map((t) => ({
    id: t.id,
    type: t.type,
    direction: t.direction,
    amount: `₹${t.amount}`,
    createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "—",
  }));

  const insightWeekCount = recent.filter((t) => {
    if (!t.createdAt) return false;
    const d = new Date(t.createdAt);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return d.getTime() >= weekAgo;
  }).length;

  return {
    account,
    recent,
    loading,
    modal,
    setModal,
    phase,
    amount,
    setAmount,
    desc,
    setDesc,
    busy,
    closeModal,
    goReview,
    backToForm,
    confirmSubmit,
    result,
    rows,
    flashTxId,
    insightWeekCount,
  };
}
