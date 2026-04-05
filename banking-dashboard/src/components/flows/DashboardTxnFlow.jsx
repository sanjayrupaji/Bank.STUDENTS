import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../Button.jsx";
import { Input } from "../Input.jsx";
import { Modal } from "../Modal.jsx";
import { TransactionSuccessView } from "../TransactionSuccessView.jsx";

export function DashboardTxnFlow({
  modal,
  phase,
  amount,
  setAmount,
  desc,
  setDesc,
  busy,
  account,
  closeModal,
  goReview,
  confirmSubmit,
  backToForm,
  result,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!modal) return null;

  const modalTitle =
    phase === "success"
      ? "Completed"
      : phase === "confirm"
        ? `Confirm ${modal === "deposit" ? "deposit" : "withdrawal"}`
        : modal === "deposit"
          ? "Deposit"
          : "Withdraw";

  const tx = result?.transaction;
  const amtNum = parseFloat(amount);
  const amtOk = Number.isFinite(amtNum) && amtNum > 0;

  return (
    <Modal
      open
      title={modalTitle}
      onClose={closeModal}
      footer={
        phase === "form" ? (
          <div className="ui-modal-actions ui-modal-actions-split">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="button" onClick={goReview} disabled={!amtOk}>
              Review
            </Button>
          </div>
        ) : phase === "confirm" ? (
          <div className="ui-modal-actions ui-modal-actions-split">
            <Button variant="ghost" type="button" onClick={backToForm}>
              Back
            </Button>
            <Button type="button" onClick={confirmSubmit} loading={busy}>
              {modal === "deposit" ? "Confirm deposit" : "Confirm withdrawal"}
            </Button>
          </div>
        ) : null
      }
    >
      {phase === "form" ? (
        <>
          <p className="ui-modal-lead">
            Enter the amount and an optional note. You’ll confirm on the next step.
          </p>
          <div className="ui-quick-amounts" role="group" aria-label="Quick amounts in rupees">
            {[100, 500, 1000, 2000, 5000].map((n) => (
              <button
                key={n}
                type="button"
                className="ui-quick-amount"
                onClick={() => setAmount(String(n))}
              >
                ₹{n.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <Input
            label="Amount (₹)"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Note (optional)"
            name="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </>
      ) : null}

      {phase === "confirm" ? (
        <div className="ui-confirm-summary">
          <p className="ui-confirm-label">You are about to {modal}</p>
          <p className="ui-confirm-amt">₹{amtOk ? amtNum.toFixed(2) : "—"}</p>
          <p className="ui-confirm-meta">
            Account · <span className="ui-mono">{account?.accountNumber}</span>
          </p>
          {desc.trim() ? <p className="ui-confirm-note">Note: {desc.trim()}</p> : null}
        </div>
      ) : null}

      {phase === "success" && tx ? (
        <TransactionSuccessView
          title={modal === "deposit" ? "Deposit successful" : "Withdrawal successful"}
          message="Your balance has been updated. A receipt is available below."
          amountDisplay={`₹${tx.amount}`}
          transaction={tx}
          userLabel={user?.fullName || user?.email}
          accountNumber={account?.accountNumber}
          onDone={closeModal}
          onViewDetails={() => {
            closeModal();
            navigate("/history");
          }}
        />
      ) : null}
    </Modal>
  );
}
