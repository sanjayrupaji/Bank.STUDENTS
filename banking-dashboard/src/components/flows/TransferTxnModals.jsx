import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "../Button.jsx";
import { Modal } from "../Modal.jsx";
import { TransactionSuccessView } from "../TransactionSuccessView.jsx";

export function TransferTxnModals({
  step,
  account,
  toAcc,
  amount,
  desc,
  loading,
  result,
  cancelFlow,
  confirmTransfer,
  closeSuccess,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!step) return null;

  const amt = parseFloat(amount);
  const amtOk = Number.isFinite(amt) && amt > 0;

  return (
    <Modal
      open
      title={step === "confirm" ? "Confirm transfer" : step === "success" ? "Completed" : ""}
      onClose={step === "success" ? closeSuccess : cancelFlow}
      footer={
        step === "confirm" ? (
          <div className="ui-modal-actions ui-modal-actions-split">
            <Button variant="ghost" type="button" onClick={cancelFlow}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmTransfer} loading={loading} disabled={!amtOk}>
              Confirm & send
            </Button>
          </div>
        ) : null
      }
    >
      {step === "confirm" ? (
        <div className="ui-confirm-summary">
          <p className="ui-confirm-label">Send to account</p>
          <p className="ui-confirm-amt ui-mono">{toAcc}</p>
          <p className="ui-confirm-label" style={{ marginTop: 16 }}>
            Amount
          </p>
          <p className="ui-confirm-amt">₹{amtOk ? amt.toFixed(2) : "—"}</p>
          <p className="ui-confirm-meta">
            From · <span className="ui-mono">{account?.accountNumber}</span>
          </p>
          {desc.trim() ? <p className="ui-confirm-note">Note: {desc.trim()}</p> : null}
        </div>
      ) : null}

      {step === "success" && result?.transaction ? (
        <TransactionSuccessView
          title="Transfer successful"
          message="Funds have been moved to the destination account."
          amountDisplay={`₹${result.transaction.amount}`}
          transaction={result.transaction}
          userLabel={user?.fullName || user?.email}
          accountNumber={account?.accountNumber}
          onDone={closeSuccess}
          onViewDetails={() => {
            closeSuccess();
            navigate("/history");
          }}
        />
      ) : null}
    </Modal>
  );
}
