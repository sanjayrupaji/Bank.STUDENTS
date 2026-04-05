import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { CopyTextButton } from "../../components/CopyTextButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export function DashboardManager({ account, rows }) {
  const { user } = useAuth();
  const school = user?.school || { name: "Your School", uniqueCode: "PENDING" };

  return (
    <div className="dashboard manager-dash animate-fade-in">
      <header className="dash-header">
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--navy)", fontSize: "2.5rem", margin: "0 0 8px 0" }}>
          {school.name} Portal
        </h1>
        <p className="dash-sub" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
          Global administration and school metrics. 🏫✨
        </p>
      </header>

      {/* ── Key School Management Banner ── */}
      <section style={{ marginBottom: 32 }}>
        <Card noPadding>
          <div style={{ padding: "32px", background: "var(--navy)", borderRadius: "var(--radius-lg)", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: "0 0 4px 0", letterSpacing: "1px" }}>SCHOOL JOIN CODE</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "2.5rem", letterSpacing: "2px" }}>
                    {school.uniqueCode}
                  </h2>
                  <CopyTextButton text={school.uniqueCode} label="Copy Code" />
                </div>
                <p style={{ marginTop: 12, opacity: 0.7, fontSize: "0.95rem" }}>
                  Share this code with your teachers and students to let them join your school.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                 <div style={{ fontSize: "3rem" }}>🏛️</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="dash-saas-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
        <div className="md-stat-card">
          <div className="md-stat-card-accent" style={{ background: "var(--gold)" }} />
          <p className="md-stat-card-label">Active Teachers</p>
          <p className="md-stat-card-value" style={{ fontFamily: "var(--font-display)" }}>0</p>
          <p className="md-stat-card-sub">Joined via code</p>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-card-accent" />
          <p className="md-stat-card-label">Total Students</p>
          <p className="md-stat-card-value" style={{ fontFamily: "var(--font-display)" }}>0</p>
          <p className="md-stat-card-sub">Managed accounts</p>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-card-accent" />
          <p className="md-stat-card-label">School Balance</p>
          <p className="md-stat-card-value" style={{ fontFamily: "var(--font-display)" }}>₹0.00</p>
          <p className="md-stat-card-sub">Across all accounts</p>
        </div>
      </section>

      <div className="dash-saas-body" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
        <div className="dash-saas-primary">
          <Card title="Recent School Activity" subtitle="Real-time transaction log for all students">
             <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                <p>Once your teachers and students join, their activity will appear here. 📈</p>
                <Button variant="secondary" style={{ marginTop: 16 }}>Download Report</Button>
             </div>
          </Card>
        </div>
        
        <aside className="dash-saas-aside">
           <Card title="Quick Actions">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 <Button variant="primary" style={{ width: "100%", textAlign: "left", justifyContent: "flex-start" }}>
                    Manage Teachers
                 </Button>
                 <Button variant="outline" style={{ width: "100%", textAlign: "left", justifyContent: "flex-start" }}>
                    School Settings
                 </Button>
                 <Button variant="outline" style={{ width: "100%", textAlign: "left", justifyContent: "flex-start" }}>
                    Bulk Import Students
                 </Button>
              </div>
           </Card>
        </aside>
      </div>
    </div>
  );
}
