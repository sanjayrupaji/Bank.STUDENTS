import { useEffect, useState, useCallback } from "react";
import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { CopyTextButton } from "../../components/CopyTextButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { api } from "../../api/client.js";

export function DashboardManager() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const school = user?.school || { name: "Your School", uniqueCode: "..." };

  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({ page: 1, totalPages: 1 });
  const [leaderboard, setLeaderboard] = useState({ topSavers: [], topTeachers: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview"); // overview | teachers | transactions | leaderboard
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [s, t, tx, lb] = await Promise.all([
        api("/api/manager/stats"),
        api("/api/manager/teachers"),
        api("/api/manager/transactions?limit=15"),
        api("/api/manager/leaderboard"),
      ]);
      setStats(s.data);
      setTeachers(t.data || []);
      setTransactions(tx.data.items || []);
      setTxPagination(tx.data.pagination || { page: 1, totalPages: 1 });
      setLeaderboard(lb.data || { topSavers: [], topTeachers: [] });
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRemoveTeacher = async (teacherId, name) => {
    if (!window.confirm(`Remove ${name} from your school? They will lose access.`)) return;
    try {
      await api(`/api/manager/teachers/${teacherId}`, { method: "DELETE" });
      showToast(`${name} has been removed`, "success");
      loadAll();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleDeleteSchool = async () => {
    if (deleteConfirm !== school.name) {
      showToast("School name doesn't match", "error");
      return;
    }
    setDeleting(true);
    try {
      await api("/api/manager/school", { method: "DELETE" });
      showToast("School deleted permanently", "success");
      logout();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const loadTxPage = async (page) => {
    try {
      const tx = await api(`/api/manager/transactions?limit=15&page=${page}`);
      setTransactions(tx.data.items || []);
      setTxPagination(tx.data.pagination || { page: 1, totalPages: 1 });
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="dashboard manager-dash animate-fade-in" style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>Loading school data...</p>
      </div>
    );
  }

  const tabStyle = (t) => ({
    padding: "10px 20px",
    border: "none",
    borderBottom: tab === t ? "3px solid var(--navy)" : "3px solid transparent",
    background: "none",
    cursor: "pointer",
    fontWeight: tab === t ? 700 : 500,
    color: tab === t ? "var(--navy)" : "var(--muted)",
    fontSize: "0.95rem",
    transition: "all 0.2s",
  });

  return (
    <div className="dashboard manager-dash animate-fade-in">
      {/* ── Header ── */}
      <header className="dash-header">
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--navy)", fontSize: "2.5rem", margin: "0 0 8px 0" }}>
          {school.name}
        </h1>
        <p className="dash-sub" style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
          Supreme Authority Dashboard — You are the school manager. 🏫
        </p>
      </header>

      {/* ── Join Code Banner ── */}
      <section style={{ marginBottom: 32 }}>
        <Card noPadding>
          <div style={{ padding: "28px 32px", background: "var(--navy)", borderRadius: "var(--radius-lg)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ opacity: 0.7, fontSize: "0.85rem", margin: "0 0 4px 0", letterSpacing: "1.5px", textTransform: "uppercase" }}>School Join Code</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "2.2rem", letterSpacing: "3px" }}>
                  {school.uniqueCode}
                </h2>
                <CopyTextButton text={school.uniqueCode} label="Copy" />
              </div>
            </div>
            <div style={{ fontSize: "2.5rem" }}>🏛️</div>
          </div>
        </Card>
      </section>

      {/* ── Live KPI Cards ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Teachers", value: stats?.teacherCount ?? 0, accent: "var(--gold)", sub: "Active staff" },
          { label: "Students", value: stats?.studentCount ?? 0, accent: "var(--primary)", sub: "Enrolled" },
          { label: "School Balance", value: `₹${stats?.totalBalance ?? "0.00"}`, accent: "#22c55e", sub: "All accounts" },
          { label: "Pending", value: stats?.pendingVerifications ?? 0, accent: "#f59e0b", sub: "Awaiting approval" },
          { label: "Transactions", value: stats?.completedTransactions ?? 0, accent: "var(--navy)", sub: "Completed" },
        ].map((kpi) => (
          <div key={kpi.label} className="md-stat-card">
            <div className="md-stat-card-accent" style={{ background: kpi.accent }} />
            <p className="md-stat-card-label">{kpi.label}</p>
            <p className="md-stat-card-value" style={{ fontFamily: "var(--font-display)" }}>{kpi.value}</p>
            <p className="md-stat-card-sub">{kpi.sub}</p>
          </div>
        ))}
      </section>

      {/* ── Tab Navigation ── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        <button style={tabStyle("overview")} onClick={() => setTab("overview")}>Overview</button>
        <button style={tabStyle("teachers")} onClick={() => setTab("teachers")}>Teachers</button>
        <button style={tabStyle("transactions")} onClick={() => setTab("transactions")}>Transactions</button>
        <button style={tabStyle("leaderboard")} onClick={() => setTab("leaderboard")}>Leaderboard</button>
        <button style={tabStyle("settings")} onClick={() => setTab("settings")}>Settings</button>
      </div>

      {/* ── Tab Content ── */}

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
          <Card title="Recent Activity" subtitle="Latest transactions across the school">
            {transactions.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>No transactions yet. Once students join and transact, activity will appear here.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={thStyle}>Student</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 8).map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                        <td style={tdStyle}>{tx.studentName}</td>
                        <td style={tdStyle}><TypeBadge type={tx.type} /></td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>₹{tx.amount}</td>
                        <td style={tdStyle}><StatusBadge status={tx.status} /></td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card title="Top Savers 🏆">
              {leaderboard.topSavers.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", textAlign: "center", padding: 20 }}>No students yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {leaderboard.topSavers.map((s) => (
                    <div key={s.rank} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontWeight: 800, fontSize: "1.1rem", color: s.rank === 1 ? "var(--gold)" : "var(--muted)", width: 24 }}>#{s.rank}</span>
                        <span style={{ fontWeight: 600 }}>{s.fullName}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--navy)" }}>₹{s.balance}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Teacher Performance ⭐">
              {leaderboard.topTeachers.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", textAlign: "center", padding: 20 }}>No teachers yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {leaderboard.topTeachers.map((t, i) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                      <span style={{ fontWeight: 600 }}>{i === 0 ? "🥇 " : i === 1 ? "🥈 " : "🥉 "}{t.fullName}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{t.verificationsCount} verifications</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {tab === "teachers" && (
        <Card title="Teacher Management" subtitle="All teachers who joined your school">
          {teachers.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>No teachers have joined yet. Share your school code: <strong>{school.uniqueCode}</strong></p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Verifications</th>
                    <th style={thStyle}>Joined</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{t.fullName}</td>
                      <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>{t.email}</td>
                      <td style={tdStyle}>
                        <span style={{ background: "var(--bg-soft)", padding: "2px 10px", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600 }}>
                          {t.verificationsCount}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{new Date(t.joinedAt).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button
                          onClick={() => handleRemoveTeacher(t.id, t.fullName)}
                          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s" }}
                          onMouseEnter={(e) => { e.target.style.background = "#dc2626"; e.target.style.color = "white"; }}
                          onMouseLeave={(e) => { e.target.style.background = "#fef2f2"; e.target.style.color = "#dc2626"; }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "transactions" && (
        <Card title="All School Transactions" subtitle="Complete transaction history across the institution">
          {transactions.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>No transactions recorded yet.</p>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={thStyle}>Student</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Initiated By</th>
                      <th style={thStyle}>Verified By</th>
                      <th style={thStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{tx.studentName}</td>
                        <td style={tdStyle}><TypeBadge type={tx.type} /></td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>₹{tx.amount}</td>
                        <td style={tdStyle}><StatusBadge status={tx.status} /></td>
                        <td style={tdStyle}>{tx.initiatedBy}</td>
                        <td style={{ ...tdStyle, color: tx.verifiedBy ? "var(--navy)" : "var(--muted)" }}>{tx.verifiedBy || "—"}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
                <Button variant="outline" size="sm" disabled={txPagination.page <= 1} onClick={() => loadTxPage(txPagination.page - 1)}>
                  ← Previous
                </Button>
                <span style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", color: "var(--muted)" }}>
                  Page {txPagination.page} of {txPagination.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={txPagination.page >= txPagination.totalPages} onClick={() => loadTxPage(txPagination.page + 1)}>
                  Next →
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {tab === "leaderboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <Card title="Top Savers 🏆" subtitle="Students with the highest savings">
            {leaderboard.topSavers.length === 0 ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>No students yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {leaderboard.topSavers.map((s) => (
                  <div key={s.rank} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: s.rank === 1 ? "var(--gold-soft)" : "transparent", borderRadius: "var(--radius)", border: "1px solid var(--border-soft)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: "1.5rem" }}>{s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : `#${s.rank}`}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700 }}>{s.fullName}</p>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase" }}>{s.role}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--navy)" }}>₹{s.balance}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Top Teachers ⭐" subtitle="Teachers with the most verified transactions">
            {leaderboard.topTeachers.length === 0 ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>No teachers have verified transactions yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {leaderboard.topTeachers.map((t, i) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: i === 0 ? "var(--gold-soft)" : "transparent", borderRadius: "var(--radius)", border: "1px solid var(--border-soft)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: "1.5rem" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                      <p style={{ margin: 0, fontWeight: 700 }}>{t.fullName}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--navy)" }}>{t.verificationsCount} verified</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "settings" && (
        <div style={{ maxWidth: 600 }}>
          <Card title="School Settings" subtitle="Manage your institutional configuration">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>School Name</p>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>{school.name}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>Join Code</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <code style={{ background: "var(--bg-soft)", padding: "4px 12px", borderRadius: 6, fontWeight: 700, letterSpacing: 1 }}>{school.uniqueCode}</code>
                  <CopyTextButton text={school.uniqueCode} label="Copy" compact />
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

              {/* Danger Zone */}
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius)", padding: 24 }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#dc2626" }}>⚠️ Danger Zone</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem", color: "#991b1b" }}>
                  Deleting your school will permanently remove all teachers, students, accounts, transactions, and data associated with <strong>{school.name}</strong>. This action cannot be undone.
                </p>
                {!showDeleteModal ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ background: "white", color: "#dc2626", borderColor: "#dc2626" }}
                  >
                    Delete School Permanently
                  </Button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#991b1b" }}>
                      Type <strong>{school.name}</strong> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type school name..."
                      style={{ padding: "10px 14px", border: "1px solid #fecaca", borderRadius: 8, fontSize: "1rem", outline: "none" }}
                    />
                    <div style={{ display: "flex", gap: 12 }}>
                      <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}>
                        Cancel
                      </Button>
                      <button
                        onClick={handleDeleteSchool}
                        disabled={deleteConfirm !== school.name || deleting}
                        style={{
                          padding: "10px 24px",
                          background: deleteConfirm === school.name ? "#dc2626" : "#e5e7eb",
                          color: deleteConfirm === school.name ? "white" : "#9ca3af",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: 700,
                          cursor: deleteConfirm === school.name ? "pointer" : "not-allowed",
                          fontSize: "0.95rem",
                          transition: "all 0.2s",
                        }}
                      >
                        {deleting ? "Deleting..." : "Delete Forever"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ──

const thStyle = { padding: "12px 8px", color: "var(--text-secondary)", fontWeight: 600, textAlign: "left", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "12px 8px" };

function TypeBadge({ type }) {
  const colors = {
    DEPOSIT: { bg: "#dcfce7", color: "#166534" },
    WITHDRAW: { bg: "#fef3c7", color: "#92400e" },
    TRANSFER: { bg: "#dbeafe", color: "#1e40af" },
  };
  const c = colors[type] || { bg: "var(--bg-soft)", color: "var(--text-secondary)" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 600, background: c.bg, color: c.color }}>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    COMPLETED: { bg: "#dcfce7", color: "#166534" },
    PENDING: { bg: "#fef3c7", color: "#92400e" },
    FAILED: { bg: "#fef2f2", color: "#dc2626" },
  };
  const c = colors[status] || { bg: "var(--bg-soft)", color: "var(--text-secondary)" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 600, background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}
