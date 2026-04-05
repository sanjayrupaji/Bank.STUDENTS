import { NavLink } from "react-router-dom";
import { Button } from "../../components/Button.jsx";
import { Card } from "../../components/Card.jsx";
import { CopyTextButton } from "../../components/CopyTextButton.jsx";
import { Table } from "../../components/Table.jsx";
import { DashboardTxnFlow } from "../../components/flows/DashboardTxnFlow.jsx";
import { DASHBOARD_COLUMNS } from "./DashboardShared.jsx";
import "../dashboard.css";
import "./dashboard-variants.css";

const columns = DASHBOARD_COLUMNS;

export function DashboardDesktop({
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
  const last = rows[0];

  return (
    <div className="dashboard dash-saas">
      <header className="dash-header dash-saas-head">
        <p className="dash-sub">Dense workspace — metrics, ledger, and shortcuts visible together</p>
        {insightWeekCount > 0 ? (
          <p className="dash-insight-line">
            Weekly pulse: {insightWeekCount} posting{insightWeekCount === 1 ? "" : "s"} in the last 7
            days in this window — compare with prior weeks in Activity.
          </p>
        ) : null}
      </header>

      <section className="dash-saas-kpis" aria-label="Key metrics">
        <div className="md-stat-card">
          <div className="md-stat-card-accent" />
          <p className="md-stat-card-label">Available Balance</p>
          <p className="md-stat-card-value">₹{account?.balance ?? "0.00"}</p>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-card-accent" />
          <p className="md-stat-card-label">Account Number</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p className="md-stat-card-value ui-mono" style={{ fontSize: "1.1rem" }}>
              {account?.accountNumber ?? "—"}
            </p>
            <CopyTextButton text={account?.accountNumber} label="Copy" compact />
          </div>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-card-accent" />
          <p className="md-stat-card-label">Transactions</p>
          <p className="md-stat-card-value">{rows.length}</p>
          <p className="md-stat-card-sub">in current view</p>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-card-accent" />
          <p className="md-stat-card-label">Last Activity</p>
          <p className="md-stat-card-value" style={{ fontSize: "1rem", fontWeight: 700 }}>
            {last ? last.createdAt : "—"}
          </p>
        </div>
      </section>

      <section className="dash-saas-toolbar" aria-label="Cash actions">
        <div className="dash-saas-toolbar-meta">
          <span className="dash-saas-toolbar-hint">Showing {rows.length} recent postings in this window</span>
        </div>
        <div className="dash-saas-toolbar-btns">
          <Button variant="primary" type="button" onClick={() => setModal("deposit")}>
            Deposit
          </Button>
          <Button variant="secondary" type="button" onClick={() => setModal("withdraw")}>
            Withdraw
          </Button>
        </div>
      </section>

      <div className="dash-saas-body">
        <div className="dash-saas-primary">
          <Card title="Ledger" subtitle="Most recent movements (same data as mobile — table layout)">
            <Table
              columns={columns}
              rows={rows}
              empty="No transactions yet — make a deposit to get started."
              rowClassName={(row) => (row.id === flashTxId ? "ui-table-row-flash" : "")}
            />
          </Card>
        </div>
        <aside className="dash-saas-aside" aria-label="Workspace shortcuts">
          <Card title="Payments" subtitle="Jump without leaving context">
            <nav className="dash-saas-shortcuts">
              <NavLink to="/transfer" className="dash-saas-shortcut">
                Transfer funds
              </NavLink>
              <NavLink to="/history" className="dash-saas-shortcut">
                Full transaction history
              </NavLink>
            </nav>
          </Card>
          <Card title="Status">
            <p className="dash-saas-aside-note">
              Balances sync live across sessions. Use Activity for filters and pagination.
            </p>
          </Card>
        </aside>
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
