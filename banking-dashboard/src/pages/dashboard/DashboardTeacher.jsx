import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export function DashboardTeacher({ account, rows }) {
  const { user } = useAuth();
  const school = user?.school || { name: "Your School" };

  return (
    <div className="dashboard teacher-dash animate-fade-in">
      <header className="dash-header" style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--navy)", fontSize: "2.5rem", margin: "0 0 8px 0" }}>
          Educator Portal
        </h1>
        <p className="dash-sub" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
          Overseeing student growth and financial literacy at <strong>{school.name}</strong>. 👨‍🏫📜
        </p>
      </header>

      <section className="teacher-verification-banner" style={{ marginBottom: 32 }}>
        <Card noPadding>
          <div style={{ padding: "24px", background: "var(--gold-soft)", border: "1px solid var(--gold)", borderRadius: "var(--radius-lg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: "2rem" }}>🛡️</div>
              <div>
                <h3 style={{ margin: 0, color: "var(--navy)", fontWeight: 700 }}>Pending Verifications</h3>
                <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  There are <strong>0</strong> transactions awaiting your genuinity check.
                </p>
              </div>
            </div>
            <Button variant="primary">Review All</Button>
          </div>
        </Card>
      </section>

      <div className="teacher-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
        <div className="teacher-main">
          <Card title="Student Directory" subtitle="Manage individual student accounts and logs">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>STUDENT NAME</th>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>CLASS</th>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>BALANCE</th>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>STATUS</th>
                    <th style={{ padding: "16px 0" }}></th>
                  </tr>
                </thead>
                <tbody>
                   <tr>
                     <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                        No students enrolled yet. share your school code to start! 🚀
                     </td>
                   </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="teacher-aside" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card title="Class Actions">
             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Button variant="primary" style={{ width: "100%", justifyContent: "flex-start" }}>
                   ➕ Add New Student
                </Button>
                <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start" }}>
                   📢 Post Announcement
                </Button>
                <Button variant="outline" style={{ width: "100%", justifyContent: "flex-start" }}>
                   📊 Export Class Report
                </Button>
             </div>
          </Card>

          <Card title="Recent Activity">
             <p style={{ fontSize: "0.9rem", color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                Classroom logs will appear here.
             </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
