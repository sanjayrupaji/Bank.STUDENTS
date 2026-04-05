import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { Table } from "../../components/Table.jsx";
import { HistoryStatementBar } from "../../components/history/HistoryStatementBar.jsx";
import "./history-variants.css";

export function HistoryTablet({
  ready,
  loading,
  page,
  setPage,
  columns,
  rows,
  pg,
  typeFilter,
  setTypeFilter,
  rangePreset,
  setRangePreset,
  statementSummary,
  txTypeOptions,
  filterHint,
}) {
  return (
    <div>
      <header className="dash-header">
        <h1 className="dash-title">Transactions</h1>
        <p className="dash-sub">Full history with pagination</p>
      </header>
      {ready ? (
        <HistoryStatementBar
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          rangePreset={rangePreset}
          setRangePreset={setRangePreset}
          statementSummary={statementSummary}
          filterHint={filterHint}
          txTypeOptions={txTypeOptions}
        />
      ) : null}
      <Card title="Activity" className="hist-t-card">
        {!ready ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
        ) : loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
        ) : (
          <Table columns={columns} rows={rows} empty="No transactions to show." />
        )}
        <div className="hist-t-pager">
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Page {pg.page || page} / {pg.totalPages || 1} · {pg.total ?? 0} total
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              variant="secondary"
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              type="button"
              disabled={page >= (pg.totalPages || 1) || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
