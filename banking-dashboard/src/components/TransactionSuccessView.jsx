import { useState } from "react";
import { Button } from "./Button.jsx";
import { ReceiptCard } from "./ReceiptCard.jsx";
import "./transaction-success.css";

export function TransactionSuccessView({
  title,
  message,
  amountDisplay,
  transaction,
  userLabel,
  accountNumber,
  onDone,
  onViewDetails,
}) {
  const [showReceipt, setShowReceipt] = useState(false);

  const shareReceipt = async () => {
    const text = [
      `Core Banking — ${transaction?.type || "Transaction"}`,
      `Amount: ₹${transaction?.amount}`,
      `ID: ${transaction?.id}`,
      transaction?.createdAt ? `When: ${new Date(transaction.createdAt).toLocaleString()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Receipt", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="txn-success">
      <div className="txn-success-icon" aria-hidden>
        <svg viewBox="0 0 48 48" className="txn-success-svg">
          <circle className="txn-success-circle" cx="24" cy="24" r="22" />
          <path className="txn-success-check" d="M14 24l7 7 13-14" fill="none" />
        </svg>
      </div>
      <h3 className="txn-success-title">{title}</h3>
      <p className="txn-success-msg">{message}</p>
      {amountDisplay ? <p className="txn-success-amt">{amountDisplay}</p> : null}

      <div className="txn-success-actions">
        <Button type="button" variant="secondary" onClick={() => setShowReceipt((v) => !v)}>
          {showReceipt ? "Hide receipt" : "View receipt"}
        </Button>
        <Button type="button" variant="secondary" onClick={shareReceipt}>
          Share receipt
        </Button>
      </div>

      {showReceipt ? (
        <ReceiptCard
          transaction={transaction}
          userLabel={userLabel}
          accountNumber={accountNumber}
        />
      ) : null}

      {onViewDetails ? (
        <button type="button" className="txn-success-link" onClick={onViewDetails}>
          View in Activity →
        </button>
      ) : null}

      <div className="txn-success-done">
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
