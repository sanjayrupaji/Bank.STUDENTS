import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { Input } from "../../components/Input.jsx";
import { TransferTxnModals } from "../../components/flows/TransferTxnModals.jsx";
import "./transfer-variants.css";

export function TransferDesktop({
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
}) {
  return (
    <div className="tf-d-wrap">
      <header className="dash-header">
        <h1 className="dash-title">Transfer</h1>
        <p className="dash-sub">Send money to another account by account number</p>
      </header>

      <dl className="tf-d-meta">
        <div>
          <dt>From account</dt>
          <dd style={{ fontFamily: "ui-monospace, monospace" }}>{account?.accountNumber || "…"}</dd>
        </div>
        <div>
          <dt>Available balance</dt>
          <dd>₹{account?.balance ?? "—"}</dd>
        </div>
      </dl>

      <Card title="Transfer funds" subtitle="Idempotent requests — safe to retry after network errors">
        <form onSubmit={prepareSubmit}>
          <Input
            label="To account (12 digits)"
            name="toAcc"
            value={toAcc}
            onChange={(e) => setToAcc(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="000000000000"
            inputMode="numeric"
            required
          />
          <Input
            label="Amount (₹)"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Note (optional)"
            name="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Button type="submit" loading={loading && !step}>
            Send transfer
          </Button>
        </form>
      </Card>

      <TransferTxnModals
        step={step}
        account={account}
        toAcc={toAcc}
        amount={amount}
        desc={desc}
        loading={loading}
        result={result}
        cancelFlow={cancelFlow}
        confirmTransfer={confirmTransfer}
        closeSuccess={closeSuccess}
      />
    </div>
  );
}
