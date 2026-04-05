import { Button } from "../../components/Button.jsx";
import { CopyTextButton } from "../../components/CopyTextButton.jsx";
import { DashboardTxnFlow } from "../../components/flows/DashboardTxnFlow.jsx";
import "./dashboard-variants.css";

export function DashboardMobile({
  account,
  rows,
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
  flashTxId,
  insightWeekCount,
}) {
  return (
    <div>
      <p className="dash-m-title">Overview</p>

      <section className="dash-m-hero" aria-label="Account balance">
        <div className="dash-m-balance-label">Available balance</div>
        <div className="dash-m-balance-val">₹{account?.balance ?? "0.00"}</div>
        <div className="dash-m-acct-row">
          <div className="dash-m-acct">Account · {account?.accountNumber}</div>
          <CopyTextButton
            text={account?.accountNumber}
            label="Copy"
            compact
            className="copy-text-btn--on-dark"
          />
        </div>
        <div className="dash-m-actions">
          <Button variant="primary" type="button" onClick={() => setModal("deposit")}>
            Deposit
          </Button>
          <Button variant="secondary" type="button" onClick={() => setModal("withdraw")}>
            Withdraw
          </Button>
        </div>
      </section>

      {insightWeekCount > 0 ? (
        <p className="dash-m-insight" role="status">
          <span className="dash-m-insight-dot" aria-hidden />
          {insightWeekCount} movement{insightWeekCount === 1 ? "" : "s"} in the last 7 days in this
          feed
        </p>
      ) : null}

      <section aria-label="Recent transactions">
        <h2 className="dash-m-section-title">Recent activity</h2>
        <p className="dash-m-section-sub">Latest movements on your account</p>
        {rows.length === 0 ? (
          <p className="dash-m-empty">No transactions yet — make a deposit to get started.</p>
        ) : (
          <div className="dash-m-tx-list">
            {rows.map((r) => (
              <article
                key={r.id}
                className={`dash-m-tx${r.id === flashTxId ? " dash-m-tx-flash" : ""}`}
              >
                <div>
                  <div className="dash-m-tx-type">
                    {r.type} · {r.direction}
                  </div>
                  <div className="dash-m-tx-date">{r.createdAt}</div>
                </div>
                <div className="dash-m-tx-amt">{r.amount}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      <DashboardTxnFlow
        modal={modal}
        phase={phase}
        amount={amount}
        setAmount={setAmount}
        desc={desc}
        setDesc={setDesc}
        busy={busy}
        account={account}
        closeModal={closeModal}
        goReview={goReview}
        confirmSubmit={confirmSubmit}
        backToForm={backToForm}
        result={result}
      />
    </div>
  );
}
