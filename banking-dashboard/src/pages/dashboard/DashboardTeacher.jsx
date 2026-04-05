import { useEffect, useState, useCallback } from "react";
import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";

export function DashboardTeacher({ account, rows }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const school = user?.school || { name: "Your School" };

  const loadData = useCallback(async () => {
    try {
      const [stuRes, penRes] = await Promise.all([
        api("/api/admin/users?limit=50"),
        api("/api/verification/pending"),
      ]);
      setStudents(stuRes.data.items || []);
      setPending(penRes.data || []);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = async (txId, action) => {
    try {
        const path = action === "approve" ? `/api/verification/approve/${txId}` : `/api/verification/reject/${txId}`;
        await api(path, { method: "POST" });
        showToast(`Transaction ${action}d`, "success");
        loadData();
    } catch (e) {
        showToast(e.message, "error");
    }
  };

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
                  There are <strong>{pending.length}</strong> transactions awaiting your genuinity check.
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={() => window.scrollTo({ top: 500, behavior: "smooth" })}>
               Review All
            </Button>
          </div>
        </Card>
      </section>

      <div className="teacher-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
        <div className="teacher-main" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* ── Pending Requests Queue ── */}
          {pending.length > 0 && (
            <Card title="Genuinity Queue" subtitle="Verify student banking requests">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {pending.map(tx => (
                        <div key={tx.id} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <p style={{ fontWeight: 700, margin: 0, color: "var(--navy)" }}>{tx.type} Request</p>
                                <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                                    <strong>{tx.initiatedBy?.fullName}</strong> is requesting ₹{tx.amountCents / 100}
                                </p>
                                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>Reason: {tx.description || "N/A"}</p>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button variant="outline" size="sm" onClick={() => handleVerify(tx.id, "reject")}>Reject</Button>
                                <Button variant="primary" size="sm" onClick={() => handleVerify(tx.id, "approve")}>Approve</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
          )}

          <Card title="Student Directory" subtitle="Manage individual student accounts and logs">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>STUDENT NAME</th>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>ROLE</th>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>EMAIL</th>
                    <th style={{ padding: "16px 0", color: "var(--text-secondary)", fontWeight: 600 }}>ENROLLED</th>
                    <th style={{ padding: "16px 0" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                         No students enrolled yet. share your school code to start! 🚀
                      </td>
                    </tr>
                  ) : (
                    students.map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                        <td style={{ padding: "16px 0", fontWeight: 600 }}>{s.fullName}</td>
                        <td style={{ padding: "16px 0" }}>
                           <span style={{ fontSize: "0.75rem", padding: "2px 8px", background: "var(--bg-soft)", borderRadius: 10, textTransform: "uppercase" }}>
                             {s.role}
                           </span>
                        </td>
                        <td style={{ padding: "16px 0", color: "var(--text-secondary)" }}>{s.email}</td>
                        <td style={{ padding: "16px 0", color: "var(--muted)" }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "16px 0", textAlign: "right" }}>
                           <Button variant="outline" size="sm">Manage</Button>
                        </td>
                      </tr>
                    ))
                  )}
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

          <Card title="Quick Stats">
             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                   <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>Class Students</p>
                   <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>{students.length}</p>
                </div>
                <div>
                   <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>Verified today</p>
                   <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>0</p>
                </div>
             </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
