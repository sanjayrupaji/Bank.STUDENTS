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
  announcements,
}) {
  const school = account?.school || { name: "Your School" };
  const last = rows[0];
  
  // Mock data for new features (to be replaced by API later)
  const savingsGoal = account?.savingsGoal || { target: 5000, label: "New Cycle" };
  const progressPercent = Math.min(100, Math.max(0, ((account?.balance || 0) / savingsGoal.target) * 100));

  return (
    <div className="dashboard dash-saas animate-fade-in">
      <header className="dash-header dash-saas-head">
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--navy)", fontSize: "2.5rem", margin: "0 0 8px 0" }}>
          Welcome back, {account?.user?.fullName || "Student"}!
        </h1>
        <p className="dash-sub" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
          Your savings at <strong>{school.name}</strong> are growing. Keep it up! 🌟
        </p>
      </header>

      {/* ── Savings Goal Progress ── */}
      <section className="dash-goal-section" style={{ marginBottom: 32 }}>
        <Card noPadding>
          <div style={{ padding: "24px", background: "var(--navy)", borderRadius: "var(--radius-lg)", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: 0 }}>SAVINGS GOAL: {savingsGoal.label}</p>
                <h2 style={{ fontFamily: "var(--font-display)", margin: "4px 0 0 0", fontSize: "1.8rem" }}>
                  ₹{account?.balance || "0"} / ₹{savingsGoal.target}
                </h2>
              </div>
              <p style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>{Math.round(progressPercent)}%</p>
            </div>
            <div style={{ height: 12, background: "rgba(255,255,255,0.15)", borderRadius: 6, overflow: "hidden" }}>
              <div 
                style={{ 
                  height: "100%", 
                  width: `${progressPercent}%`, 
                  background: "var(--gold)", 
                  transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)" 
                }} 
              />
            </div>
          </div>
        </Card>
      </section>

      <section className="dash-saas-kpis" aria-label="Key metrics">
        <div className="md-stat-card">
          <div className="md-stat-card-accent" style={{ background: "var(--gold)" }} />
          <p className="md-stat-card-label">Available Balance</p>
          <p className="md-stat-card-value" style={{ fontFamily: "var(--font-display)" }}>₹{account?.balance ?? "0.00"}</p>
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
          <p className="md-stat-card-label">Last Activity</p>
          <p className="md-stat-card-value" style={{ fontSize: "1rem", fontWeight: 700 }}>
            {last ? last.createdAt : "Just now"}
          </p>
        </div>
      </section>

      {/* ── Institutional Announcements ── */}
      {announcements && announcements.length > 0 && (
        <section className="dash-announcements" style={{ marginBottom: 32 }}>
          <Card title="Institutional Updates" subtitle="Official messages from your school staff">
             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {announcements.map(ann => (
                   <div key={ann.id} style={{ padding: "16px", background: ann.isPinned ? "var(--gold-soft)" : "transparent", borderLeft: `4px solid ${ann.isPinned ? "var(--gold)" : "var(--border)"}`, borderRadius: "var(--radius)" }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{ann.title}</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{ann.body}</p>
                      <p style={{ margin: "8px 0 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
                        Posted by {ann.teacher?.fullName} • {new Date(ann.createdAt).toLocaleDateString()}
                      </p>
                   </div>
                ))}
             </div>
          </Card>
        </section>
      )}

      <section className="dash-saas-toolbar" aria-label="Cash actions" style={{ background: "var(--cream-d)", borderRadius: "var(--radius)", padding: "16px 24px", border: "1px solid var(--border)" }}>
        <div className="dash-saas-toolbar-meta">
          <span className="dash-saas-toolbar-hint" style={{ fontWeight: 600, color: "var(--navy)" }}>Manage your funds</span>
        </div>
        <div className="dash-saas-toolbar-btns">
          <Button variant="primary" type="button" onClick={() => setModal("deposit")} style={{ borderRadius: "var(--radius-lg)" }}>
             Deposit Money
          </Button>
          <Button variant="secondary" type="button" onClick={() => setModal("withdraw")} style={{ borderRadius: "var(--radius-lg)" }}>
             Withdraw
          </Button>
        </div>
      </section>

      <div className="dash-saas-body">
        <div className="dash-saas-primary">
          <Card title="Ledger" subtitle="Your recent school transactions">
            <Table
              columns={columns}
              rows={rows}
              empty="No transactions yet — make your first deposit!"
              rowClassName={(row) => (row.id === flashTxId ? "ui-table-row-flash" : "")}
            />
          </Card>
        </div>
        <aside className="dash-saas-aside" aria-label="Workspace shortcuts">
          <Card title="Achievements" subtitle="Badges earned this month">
            <div style={{ display: "flex", gap: 12, padding: "8px 0" }}>
              <div title="Early Bird" style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold-p)", display: "grid", placeItems: "center", fontSize: "1.5rem" }}>🏆</div>
              <div title="Consistent Saver" style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold-p)", display: "grid", placeItems: "center", fontSize: "1.5rem", opacity: 0.4 }}>💎</div>
              <div title="Goal Getter" style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold-p)", display: "grid", placeItems: "center", fontSize: "1.5rem", opacity: 0.4 }}>🎯</div>
            </div>
          </Card>
          
          <Card title="Quick Links">
            <nav className="dash-saas-shortcuts">
              <NavLink to="/transfer" className="dash-saas-shortcut">
                Transfer to Peer
              </NavLink>
              <NavLink to="/history" className="dash-saas-shortcut">
                Passbook View
              </NavLink>
            </nav>
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
