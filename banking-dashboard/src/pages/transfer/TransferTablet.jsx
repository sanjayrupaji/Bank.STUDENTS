import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { Input } from "../../components/Input.jsx";
import { TransferTxnModals } from "../../components/flows/TransferTxnModals.jsx";
import "./transfer-variants.css";

export function TransferTablet({
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
        <p className="dash-sub">Send money by destination account number</p>
      </header>

      <div className="tf-t-grid">
        <div className="tf-t-side">
          <h2>Source</h2>
          <p className="tf-t-bal">₹{account?.balance ?? "—"}</p>
          <p className="tf-t-acct">{account?.accountNumber || "…"}</p>
        </div>
        <Card title="Transfer details">
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
