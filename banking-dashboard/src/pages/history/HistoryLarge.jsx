import { Card } from "../../components/Card.jsx";
import { Button } from "../../components/Button.jsx";
import { Table } from "../../components/Table.jsx";
import { HistoryStatementBar } from "../../components/history/HistoryStatementBar.jsx";
import "./history-variants.css";

export function HistoryLarge({
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
  const last = rows[0];

  return (
    <div>
      <header className="dash-header">
        <h1 className="dash-title">Transactions</h1>
        <p className="dash-sub">Full history with pagination and workspace context</p>
      </header>

      <div className="hist-l-grid">
        <div>
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
          <div className="hist-d-toolbar">
            <p>
              Page {pg.page || page} of {pg.totalPages || 1} · {pg.total ?? 0} movements
            </p>
            <div className="hist-d-pager">
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
          <Card title="Activity">
            {!ready ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : loading ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : (
              <Table columns={columns} rows={rows} empty="No transactions to show." />
            )}
          </Card>
        </div>
        <aside className="hist-l-side" aria-label="Activity summary">
          <h3>On this page</h3>
          <div className="hist-l-stat">
            Rows shown
            <strong>{rows.length}</strong>
          </div>
          {last ? (
            <div className="hist-l-stat">
              Newest entry
              <strong>{last.amount}</strong>
              <span style={{ fontSize: "0.75rem", display: "block", marginTop: 6 }}>
                {last.type} · {last.createdAt}
              </span>
            </div>
          ) : null}
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Export and advanced filters can be layered here in a production build.
          </p>
        </aside>
      </div>
    </div>
  );
}
