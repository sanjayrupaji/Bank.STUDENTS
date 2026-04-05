import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  fetchKpis,
  fetchVolume,
  fetchFlows,
  fetchGrowth,
  fetchActivity,
  fetchSystem,
  fetchHealth,
  fetchAdminUsers,
  fetchAdminAccounts,
  fetchAdminTransactions,
  downloadTransactionsCsv,
} from "../../api/admin.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useLayoutTier } from "../../context/LayoutTierContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { Card } from "../../components/Card.jsx";
import { Table } from "../../components/Table.jsx";
import { Button } from "../../components/Button.jsx";
import { Input } from "../../components/Input.jsx";
import { Skeleton, SkeletonCard } from "../../components/Skeleton.jsx";
import "./admin.css";

const PRESETS = [
  { id: "daily", label: "Today" },
  { id: "weekly", label: "7 days" },
  { id: "monthly", label: "30 days" },
];

const TX_TYPES = ["", "DEPOSIT", "WITHDRAW", "TRANSFER"];

function rupeesFromDisplay(s) {
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function mergeGrowth(growth) {
  const map = new Map();
  for (const u of growth?.usersPerDay || []) {
    map.set(u.date, { date: u.date, users: u.count, accounts: 0 });
  }
  for (const a of growth?.accountsPerDay || []) {
    const cur = map.get(a.date) || { date: a.date, users: 0, accounts: 0 };
    cur.accounts = a.count;
    map.set(a.date, cur);
  }
  return [...map.values()].sort((x, y) => x.date.localeCompare(y.date));
}

const AdminKpiCard = memo(function AdminKpiCard({ label, value, hint }) {
  return (
    <div className="admin-kpi">
      <p className="admin-kpi-label">{label}</p>
      <p className="admin-kpi-value">{value}</p>
      {hint ? <p className="admin-kpi-hint">{hint}</p> : null}
    </div>
  );
});

export function AdminConsole() {
  const layoutTier = useLayoutTier();
  const { showToast } = useToast();
  const { socket, connected } = useSocket();

  const [mainTab, setMainTab] = useState("overview");
  const [preset, setPreset] = useState("monthly");

  const [kpis, setKpis] = useState(null);
  const [volume, setVolume] = useState(null);
  const [flows, setFlows] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [dataTab, setDataTab] = useState("users");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [searchInput, setSearchInput] = useState("");
  const debouncedQ = useDebouncedValue(searchInput, 320);
  const [txType, setTxType] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [listRows, setListRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [exportBusy, setExportBusy] = useState(false);
  const filtersId = useMemo(
    () => `${dataTab}|${debouncedQ}|${txType}|${sortField}|${sortDir}`,
    [dataTab, debouncedQ, txType, sortField, sortDir]
  );
  const prevFiltersId = useRef(null);

  const [activity, setActivity] = useState([]);
  const [system, setSystem] = useState(null);
  const [health, setHealth] = useState(null);
  const [monitorLoading, setMonitorLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const [k, v, f, g] = await Promise.all([
        fetchKpis(),
        fetchVolume(preset),
        fetchFlows(preset),
        fetchGrowth(preset),
      ]);
      setKpis(k.data);
      setVolume(v.data);
      setFlows(f.data);
      setGrowth(g.data);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setOverviewLoading(false);
    }
  }, [preset, showToast]);

  const loadOverviewRef = useRef(loadOverview);
  loadOverviewRef.current = loadOverview;

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (!socket) return;
    let t;
    const onRefresh = () => {
      clearTimeout(t);
      t = setTimeout(() => loadOverviewRef.current(), 280);
    };
    socket.on("analytics:refresh", onRefresh);
    return () => {
      clearTimeout(t);
      socket.off("analytics:refresh", onRefresh);
    };
  }, [socket]);

  const defaultPagination = useMemo(
    () => ({ page: 1, limit: 15, total: 0, totalPages: 1 }),
    []
  );

  useEffect(() => {
    if (mainTab !== "directory") return;
    let cancelled = false;
    const filtersChanged = prevFiltersId.current !== filtersId;
    prevFiltersId.current = filtersId;
    const effectivePage = filtersChanged ? 1 : page;
    if (filtersChanged && page !== 1) setPage(1);

    (async () => {
      setListLoading(true);
      const base = { page: effectivePage, limit: 15, q: debouncedQ, sortField, sortDir };
      try {
        let res;
        if (dataTab === "users") res = await fetchAdminUsers(base);
        else if (dataTab === "accounts") res = await fetchAdminAccounts(base);
        else res = await fetchAdminTransactions({ ...base, type: txType || undefined });
        if (cancelled) return;
        setListRows(res.data.items || []);
        setPagination(res.data.pagination ?? defaultPagination);
      } catch (e) {
        if (!cancelled) showToast(e.message, "error");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    mainTab,
    page,
    filtersId,
    dataTab,
    debouncedQ,
    sortField,
    sortDir,
    txType,
    showToast,
    defaultPagination,
  ]);

  const loadMonitor = useCallback(async () => {
    setMonitorLoading(true);
    try {
      const [act, sys, h] = await Promise.all([
        fetchActivity(50),
        fetchSystem(),
        fetchHealth(),
      ]);
      setActivity((act.data.items || []).map(mapActivityRow));
      setSystem(sys.data);
      setHealth(h);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setMonitorLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (mainTab !== "monitor") return;
    loadMonitor();
    const id = setInterval(loadMonitor, 30000);
    return () => clearInterval(id);
  }, [mainTab, loadMonitor]);

  useEffect(() => {
    if (!socket || mainTab !== "monitor") return;
    const onTx = (payload) => {
      const t = payload?.transaction;
      if (!t) return;
      const row = mapSocketActivity(t);
      setActivity((prev) => {
        if (prev.some((x) => x.id === row.id)) return prev;
        return [row, ...prev].slice(0, 60);
      });
    };
    socket.on("transaction:new", onTx);
    return () => {
      socket.off("transaction:new", onTx);
    };
  }, [socket, mainTab]);

  const volumeChartData = useMemo(() => {
    const series = volume?.series || [];
    return series.map((r) => ({
      date: r.date,
      volume: rupeesFromDisplay(r.volume),
      count: r.count,
    }));
  }, [volume]);

  const flowBarData = useMemo(() => {
    if (!flows) return [];
    return [
      { name: "Deposits", amount: rupeesFromDisplay(flows.inflow) },
      { name: "Withdrawals", amount: rupeesFromDisplay(flows.outflow) },
      { name: "Transfers", amount: rupeesFromDisplay(flows.transferVolume) },
    ];
  }, [flows]);

  const growthChartData = useMemo(() => mergeGrowth(growth), [growth]);

  const userColumns = useMemo(
    () => [
      { key: "email", label: "Email" },
      { key: "fullName", label: "Name" },
      { key: "role", label: "Role" },
      { key: "createdAt", label: "Joined" },
    ],
    []
  );

  const userTableRows = useMemo(
    () =>
      listRows.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleString() : "—",
      })),
    [listRows]
  );

  const accountColumns = useMemo(
    () => [
      { key: "accountNumber", label: "Account" },
      { key: "owner", label: "Owner" },
      { key: "balance", label: "Balance" },
      { key: "createdAt", label: "Opened" },
    ],
    []
  );

  const accountTableRows = useMemo(
    () =>
      listRows.map((a) => ({
        id: a.id,
        accountNumber: a.accountNumber,
        owner: a.owner?.email || "—",
        balance: `₹${a.balance}`,
        createdAt: a.createdAt ? new Date(a.createdAt).toLocaleString() : "—",
      })),
    [listRows]
  );

  const txColumns = useMemo(
    () => [
      { key: "type", label: "Type" },
      { key: "amount", label: "Amount" },
      { key: "initiatedBy", label: "By" },
      { key: "createdAt", label: "When" },
    ],
    []
  );

  const txTableRows = useMemo(
    () =>
      listRows.map((t) => ({
        id: t.id,
        type: t.type,
        amount: `₹${t.amount}`,
        initiatedBy: t.initiatedBy?.email || "—",
        createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "—",
      })),
    [listRows]
  );

  const sortOptions = useMemo(() => {
    if (dataTab === "users") {
      return [
        { v: "createdAt", l: "Joined" },
        { v: "email", l: "Email" },
        { v: "fullName", l: "Name" },
      ];
    }
    if (dataTab === "accounts") {
      return [
        { v: "createdAt", l: "Opened" },
        { v: "accountNumber", l: "Account #" },
        { v: "balance", l: "Balance" },
      ];
    }
    return [
      { v: "createdAt", l: "Time" },
      { v: "amount", l: "Amount" },
      { v: "type", l: "Type" },
    ];
  }, [dataTab]);

  const onExport = async () => {
    setExportBusy(true);
    try {
      await downloadTransactionsCsv({
        q: debouncedQ,
        type: txType || undefined,
      });
      showToast("CSV downloaded", "success");
    } catch (e) {
      showToast(e.message || "Export failed", "error");
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div
      className="admin-console admin-page-fade"
      data-layout-tier={layoutTier}
    >
      <header className="dash-header">
        <h1 className="dash-title">Operations console</h1>
        <p className="dash-sub">Live metrics, directory, and system health</p>
      </header>

      <div className="admin-toolbar">
        <div className="admin-preset" role="group" aria-label="Date range">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              data-on={preset === p.id ? "1" : "0"}
              onClick={() => setPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="admin-live">
          <span className="admin-live-dot" data-on={connected ? "1" : "0"} aria-hidden />
          <span>{connected ? "Live channel connected" : "Connecting…"}</span>
        </div>
      </div>

      <div className="admin-tabs">
        {[
          { id: "overview", label: "Overview" },
          { id: "directory", label: "Data" },
          { id: "monitor", label: "Monitor" },
        ].map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={mainTab === t.id ? "primary" : "secondary"}
            onClick={() => setMainTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {mainTab === "overview" &&
        (() => {
          const core = (
            <>
          {overviewLoading && !kpis ? (
            <div className="admin-kpi-grid">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="skel-line" style={{ height: 88, borderRadius: 12 }} />
              ))}
            </div>
          ) : (
            <div className="admin-kpi-grid">
              <AdminKpiCard label="Total users" value={kpis ? String(kpis.totalUsers) : "—"} />
              <AdminKpiCard label="Total accounts" value={kpis ? String(kpis.totalAccounts) : "—"} />
              <AdminKpiCard
                label="Transactions (completed)"
                value={kpis ? String(kpis.totalTransactions) : "—"}
              />
              <AdminKpiCard
                label="Total volume (₹)"
                value={kpis ? `₹${kpis.totalVolume}` : "—"}
                hint={
                  kpis
                    ? `${kpis.activeUsersLast7Days} active users (7d)`
                    : undefined
                }
              />
            </div>
          )}

          <div className="admin-chart-grid">
            <Card title="Transaction volume" subtitle="Completed volume by day" className="admin-chart-card">
              {overviewLoading && !volume?.series?.length ? (
                <SkeletonCard />
              ) : volumeChartData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={volumeChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toFixed(2)}`, "Volume"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={false}
                      animationDuration={600}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="ui-table-empty" style={{ padding: 24 }}>
                  No volume in this range yet.
                </p>
              )}
            </Card>

            <Card title="Inflow vs outflow" subtitle="By transaction type" className="admin-chart-card">
              {overviewLoading && !flows ? (
                <SkeletonCard />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={flowBarData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toFixed(2)}`, "Amount"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                    />
                    <Bar dataKey="amount" fill="var(--accent)" radius={[6, 6, 0, 0]} animationDuration={600} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <Card title="Growth" subtitle="New users and accounts per day">
            {overviewLoading && !growth ? (
              <SkeletonCard />
            ) : growthChartData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={growthChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={600}
                  />
                  <Line
                    type="monotone"
                    dataKey="accounts"
                    name="Accounts"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="ui-table-empty" style={{ padding: 24 }}>
                No sign-ups in this range.
              </p>
            )}
          </Card>
            </>
          );
          if (layoutTier !== "large") return core;
          return (
            <div className="admin-l-overview">
              <div className="admin-l-overview-main">{core}</div>
              <aside className="admin-l-overview-rail" aria-label="Platform snapshot">
                <h3 className="admin-l-rail-title">At a glance</h3>
                <p className="admin-l-rail-body">
                  Change the date preset to compare periods. Open Data or Monitor for directory feeds and runtime
                  health.
                </p>
                {kpis ? (
                  <dl className="admin-l-rail-dl">
                    <div>
                      <dt>Users</dt>
                      <dd>{String(kpis.totalUsers)}</dd>
                    </div>
                    <div>
                      <dt>Accounts</dt>
                      <dd>{String(kpis.totalAccounts)}</dd>
                    </div>
                    <div>
                      <dt>Completed tx</dt>
                      <dd>{String(kpis.totalTransactions)}</dd>
                    </div>
                  </dl>
                ) : null}
              </aside>
            </div>
          );
        })()}

      {mainTab === "directory" && (
        <>
          <div className="admin-subtabs">
            {["users", "accounts", "transactions"].map((t) => (
              <Button
                key={t}
                type="button"
                variant={dataTab === t ? "primary" : "secondary"}
                onClick={() => setDataTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>

          <div className="admin-table-tools">
            <Input
              label="Search"
              name="q"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                dataTab === "accounts"
                  ? "Account number…"
                  : dataTab === "transactions"
                    ? "Description or id…"
                    : "Email or name…"
              }
            />
            {dataTab === "transactions" && (
              <div className="ui-field">
                <label className="ui-label" htmlFor="tx-type">
                  Type
                </label>
                <select
                  id="tx-type"
                  className="ui-input"
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                >
                  {TX_TYPES.map((x) => (
                    <option key={x || "all"} value={x}>
                      {x || "All types"}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="ui-field">
              <label className="ui-label" htmlFor="sort-field">
                Sort by
              </label>
              <select
                id="sort-field"
                className="ui-input"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                {sortOptions.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="sort-dir">
                Order
              </label>
              <select
                id="sort-dir"
                className="ui-input"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            {dataTab === "transactions" && (
              <Button type="button" variant="secondary" disabled={exportBusy} onClick={onExport}>
                {exportBusy ? "Exporting…" : "Export CSV"}
              </Button>
            )}
          </div>

          <Card
            title={
              dataTab === "users"
                ? "Users"
                : dataTab === "accounts"
                  ? "Accounts"
                  : "Transactions"
            }
          >
            {listLoading ? (
              <Skeleton className="skel-line" style={{ height: 200, borderRadius: 10 }} />
            ) : layoutTier === "mobile" ? (
              <div className="admin-m-entity-list">
                {dataTab === "users" &&
                  userTableRows.map((u) => (
                    <div key={u.id} className="admin-m-entity-card">
                      <strong>{u.fullName}</strong>
                      <div className="admin-m-entity-meta">{u.email}</div>
                      <div className="admin-m-entity-meta">
                        {u.role} · {u.createdAt}
                      </div>
                    </div>
                  ))}
                {dataTab === "accounts" &&
                  accountTableRows.map((a) => (
                    <div key={a.id} className="admin-m-entity-card">
                      <strong>{a.accountNumber}</strong>
                      <div className="admin-m-entity-meta">{a.owner}</div>
                      <div className="admin-m-entity-meta">
                        {a.balance} · {a.createdAt}
                      </div>
                    </div>
                  ))}
                {dataTab === "transactions" &&
                  txTableRows.map((t) => (
                    <div key={t.id} className="admin-m-entity-card">
                      <strong>{t.type}</strong>
                      <div className="admin-m-entity-meta">{t.amount}</div>
                      <div className="admin-m-entity-meta">
                        {t.initiatedBy} · {t.createdAt}
                      </div>
                    </div>
                  ))}
                {dataTab === "users" && !userTableRows.length ? (
                  <p className="admin-m-empty">No users match your filters.</p>
                ) : null}
                {dataTab === "accounts" && !accountTableRows.length ? (
                  <p className="admin-m-empty">No accounts match your filters.</p>
                ) : null}
                {dataTab === "transactions" && !txTableRows.length ? (
                  <p className="admin-m-empty">No transactions match your filters.</p>
                ) : null}
              </div>
            ) : dataTab === "users" ? (
              <Table columns={userColumns} rows={userTableRows} empty="No users match your filters." />
            ) : dataTab === "accounts" ? (
              <Table columns={accountColumns} rows={accountTableRows} empty="No accounts match your filters." />
            ) : (
              <Table columns={txColumns} rows={txTableRows} empty="No transactions match your filters." />
            )}
            <div className="admin-pagination">
              <span>
                Page {pagination.page} / {pagination.totalPages} · {pagination.total} total
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={listLoading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={listLoading || page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </Card>
        </>
      )}

      {mainTab === "monitor" && (
        <div className="admin-monitor-grid">
          <Card title="API health">
            {monitorLoading && !health ? (
              <SkeletonCard />
            ) : (
              <div style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 8px" }}>
                  Status:{" "}
                  <strong style={{ color: health?.ok ? "#16a34a" : "var(--danger)" }}>
                    {health?.ok ? "OK" : "Down"}
                  </strong>{" "}
                  ({health?.status ?? "—"})
                </p>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                  Polled every 30s alongside system metrics.
                </p>
              </div>
            )}
          </Card>

          <Card title="Runtime">
            {monitorLoading && !system ? (
              <SkeletonCard />
            ) : system ? (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.875rem", lineHeight: 1.7 }}>
                <li>Uptime: {system.uptimeHuman}</li>
                <li>Node: {system.node}</li>
                <li>PID: {system.pid}</li>
                <li>
                  Memory (heap): {(system.memory.heapUsed / 1024 / 1024).toFixed(1)} MB /{" "}
                  {(system.memory.heapTotal / 1024 / 1024).toFixed(1)} MB
                </li>
                <li>
                  Database: <strong>{system.database}</strong>
                </li>
              </ul>
            ) : null}
          </Card>

          <Card title="Recent server errors" subtitle="Last 500-level events (in-memory)">
            {!system?.recentErrors?.length ? (
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                No recent errors recorded.
              </p>
            ) : (
              <div className="admin-feed">
                {system.recentErrors.map((e, i) => (
                  <div key={`${e.at}-${i}`} className="admin-error-item">
                    <div>{e.at}</div>
                    <div>
                      <code>{e.statusCode}</code> {e.path} — {e.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Activity feed" subtitle="Recent completed transactions">
            {monitorLoading && !activity.length ? (
              <SkeletonCard />
            ) : (
              <div className="admin-feed">
                {activity.length === 0 ? (
                  <p style={{ padding: 16, margin: 0, color: "var(--text-secondary)" }}>No activity yet.</p>
                ) : (
                  activity.map((row) => (
                    <div key={row.id} className="admin-feed-item" data-live={row.live ? "1" : "0"}>
                      <strong>{row.type}</strong> · ₹{row.amountRaw} · {row.when}
                      {row.by ? ` · ${row.by}` : ""}
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function mapActivityRow(t) {
  return {
    id: t.id,
    type: t.type,
    amountRaw: t.amount,
    when: t.createdAt ? new Date(t.createdAt).toLocaleString() : "—",
    by: t.initiatedBy?.email || "",
    live: false,
  };
}

function mapSocketActivity(t) {
  return {
    id: t.id,
    type: t.type,
    amountRaw: t.amount,
    when: t.createdAt ? new Date(t.createdAt).toLocaleString() : "—",
    by: "",
    live: true,
  };
}
