import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { playSuccessChime } from "../utils/playSuccessChime.js";

export function useTransferPage() {
  const { showToast } = useToast();
  const [account, setAccount] = useState(null);
  const [toAcc, setToAcc] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(null);
  const [result, setResult] = useState(null);

  const loadAccount = useCallback(async () => {
    const accRes = await api("/api/accounts/me");
    setAccount(accRes.data.account);
  }, []);

  useEffect(() => {
    api("/api/accounts/me")
      .then((r) => setAccount(r.data.account))
      .catch((e) => showToast(e.message, "error"));
  }, [showToast]);

  const prepareSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!account) return;
      const amt = parseFloat(amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        showToast("Enter a valid amount", "error");
        return;
      }
      if (!/^\d{12}$/.test(toAcc.trim())) {
        showToast("Destination must be a 12-digit account number", "error");
        return;
      }
      setStep("confirm");
    },
    [account, amount, toAcc, showToast]
  );

  const cancelFlow = useCallback(() => {
    setStep(null);
  }, []);

  const confirmTransfer = useCallback(async () => {
    if (!account) return;
    const amt = parseFloat(amount);
    setLoading(true);
    try {
      const res = await api("/api/transactions/transfer", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          fromAccountId: account.id,
          toAccountNumber: toAcc.trim(),
          amount: amt,
          description: desc.trim() || undefined,
        }),
      });
      setResult(res.data);
      setStep("success");
      playSuccessChime();
      setToAcc("");
      setAmount("");
      setDesc("");
      await loadAccount();
    } catch (err) {
      showToast(err.message, "error");
      setStep(null);
    } finally {
      setLoading(false);
    }
  }, [account, amount, desc, toAcc, showToast, loadAccount]);

  const closeSuccess = useCallback(() => {
    setStep(null);
    setResult(null);
  }, []);

  return {
    account,
    toAcc,
    setToAcc,
    amount,
    setAmount,
    desc,
    setDesc,
    loading,
    prepareSubmit,
    step,
    result,
    cancelFlow,
    confirmTransfer,
    closeSuccess,
  };
}
