import { useMemo } from "react";
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

export function DashboardLarge({
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
  const typeMix = useMemo(() => {
    const m = {};
    for (const r of rows) {
      const k = r.type || "—";
      m[k] = (m[k] || 0) + 1;
    }
    return m;
  }, [rows]);
  const maxMix = Math.max(1, ...Object.values(typeMix));

  return (
    <div className="dashboard dash-lg">
      <header className="dash-header dash-lg-head">
        <p className="dash-sub">
          Expanded canvas — KPIs, activity mix, ledger, and context panel visible together
        </p>
        {insightWeekCount > 0 ? (
          <p className="dash-insight-line">
            Trend hint: {insightWeekCount} movement{insightWeekCount === 1 ? "" : "s"} recorded in the
            last 7 days within this snapshot.
          </p>
        ) : null}
      </header>

      <section className="dash-lg-kpis" aria-label="Key metrics">
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
          <p className="md-stat-card-label">Movements in View</p>
          <p className="md-stat-card-value">{rows.length}</p>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-card-accent" />
          <p className="md-stat-card-label">Latest Post</p>
          <p className="md-stat-card-value" style={{ fontSize: "1rem", fontWeight: 700 }}>
            {last ? last.type : "—"}
          </p>
        </div>
      </section>

      <div className="dash-lg-toolbar">
        <Button variant="primary" type="button" onClick={() => setModal("deposit")}>
          Deposit
        </Button>
        <Button variant="secondary" type="button" onClick={() => setModal("withdraw")}>
          Withdraw
        </Button>
        <NavLink to="/transfer" className="dash-lg-toolbar-link">
          New transfer
        </NavLink>
        <NavLink to="/history" className="dash-lg-toolbar-link">
          Activity
        </NavLink>
      </div>

      <div className="dash-lg-main-grid">
        <div className="dash-lg-col-ledger">
          <Card title="Ledger" subtitle="Dense table — primary working area">
            <Table
              columns={columns}
              rows={rows}
              empty="No transactions yet — make a deposit to get started."
              rowClassName={(row) => (row.id === flashTxId ? "ui-table-row-flash" : "")}
            />
          </Card>
        </div>
        <div className="dash-lg-col-analytics">
          <Card title="Activity mix" subtitle="Share of types in current window">
            {rows.length === 0 ? (
              <p className="dash-lg-empty">No data in this window.</p>
            ) : (
              <ul className="dash-lg-bars" aria-label="Transaction types">
                {Object.entries(typeMix).map(([label, count]) => (
                  <li key={label} className="dash-lg-bar-row">
                    <span className="dash-lg-bar-name">{label}</span>
                    <div className="dash-lg-bar-track">
                      <div
                        className="dash-lg-bar-fill"
                        style={{ width: `${(count / maxMix) * 100}%` }}
                      />
                    </div>
                    <span className="dash-lg-bar-count">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <aside className="dash-lg-rail" aria-label="Insights">
          <h3 className="dash-lg-rail-h">Insights</h3>
          <p className="dash-lg-rail-p">
            This tier uses a third column for analytics-style context while keeping the ledger dominant.
            Same underlying rows as every other device.
          </p>
          <div className="dash-lg-rail-block">
            <span className="dash-lg-rail-k">Rows shown</span>
            <strong>{rows.length}</strong>
          </div>
          {last ? (
            <div className="dash-lg-rail-block">
              <span className="dash-lg-rail-k">Last amount</span>
              <strong>{last.amount}</strong>
              <span className="dash-lg-rail-sub">{last.createdAt}</span>
            </div>
          ) : null}
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
