import { Button } from "../../components/Button.jsx";
import { Card } from "../../components/Card.jsx";
import { CopyTextButton } from "../../components/CopyTextButton.jsx";
import { Table } from "../../components/Table.jsx";
import { NavLink } from "react-router-dom";
import { DashboardTxnFlow } from "../../components/flows/DashboardTxnFlow.jsx";
import { DASHBOARD_COLUMNS } from "./DashboardShared.jsx";
import "../dashboard.css";
import "./dashboard-variants.css";

const columns = DASHBOARD_COLUMNS;

export function DashboardTablet({
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
    <div className="dashboard dash-tab-root">
      <header className="dash-header">
        <p className="dash-sub">Balance summary and recent movements in two columns</p>
        {insightWeekCount > 0 ? (
          <p className="dash-insight-line">
            Insight: {insightWeekCount} posting{insightWeekCount === 1 ? "" : "s"} in the last 7 days
            (this feed)
          </p>
        ) : null}
      </header>

      <section className="dash-tab-summary" aria-label="Account summary">
        <div className="dash-tab-summary-main">
          <div className="dash-tab-summary-label">Available balance</div>
          <div className="dash-tab-summary-val">₹{account?.balance ?? "0.00"}</div>
          <div className="dash-tab-summary-acct-row">
            <span className="dash-tab-summary-acct">{account?.accountNumber}</span>
            <CopyTextButton text={account?.accountNumber} label="Copy #" compact />
          </div>
        </div>
        <div className="dash-tab-summary-actions">
          <Button variant="primary" type="button" onClick={() => setModal("deposit")}>
            Deposit
          </Button>
          <Button variant="secondary" type="button" onClick={() => setModal("withdraw")}>
            Withdraw
          </Button>
        </div>
      </section>

      <div className="dash-tab-grid">
        <Card className="dash-tab-card-main" title="Recent transactions" subtitle="Table view">
          <Table
            columns={columns}
            rows={rows}
            empty="No transactions yet — make a deposit to get started."
            rowClassName={(row) => (row.id === flashTxId ? "ui-table-row-flash" : "")}
          />
        </Card>
        <div className="dash-tab-aside">
          <Card title="Next steps" subtitle="Hybrid layout">
            <ul className="dash-tab-links">
              <li>
                <NavLink to="/transfer">Send a transfer →</NavLink>
              </li>
              <li>
                <NavLink to="/history">Full activity log →</NavLink>
              </li>
            </ul>
          </Card>
        </div>
      </div>

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
