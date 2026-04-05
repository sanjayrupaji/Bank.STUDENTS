import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { Input } from "../../components/Input.jsx";
import { TransferTxnModals } from "../../components/flows/TransferTxnModals.jsx";
import "./transfer-variants.css";

export function TransferLarge({
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
    <div>
      <header className="dash-header">
        <h1 className="dash-title">Transfer</h1>
        <p className="dash-sub">Send money to another account by account number</p>
      </header>

      <div className="tf-l-grid">
        <div>
          <dl className="tf-d-meta" style={{ marginBottom: 20 }}>
            <div>
              <dt>From account</dt>
              <dd style={{ fontFamily: "ui-monospace, monospace" }}>{account?.accountNumber || "…"}</dd>
            </div>
            <div>
              <dt>Available balance</dt>
              <dd>₹{account?.balance ?? "—"}</dd>
            </div>
          </dl>
          <Card title="Transfer funds" subtitle="Double-check the destination before confirming">
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
        </div>
        <aside className="tf-l-rail" aria-label="Transfer tips">
          <h3>Before you send</h3>
          <ul>
            <li>Transfers post immediately and update both balances in real time.</li>
            <li>Use the exact 12-digit account number — no IFSC needed in this demo.</li>
            <li>Failed transfers leave balances unchanged; check the error message and retry.</li>
          </ul>
        </aside>
      </div>

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
