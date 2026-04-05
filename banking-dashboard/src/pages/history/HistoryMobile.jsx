import { Button } from "../../components/Button.jsx";
import { HistoryStatementBar } from "../../components/history/HistoryStatementBar.jsx";
import "./history-variants.css";

export function HistoryMobile({
  ready,
  loading,
  page,
  setPage,
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
        <h1 className="dash-title">Activity</h1>
        <p className="dash-sub">Latest movements on your account</p>
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

      {!ready || loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No transactions to show.</p>
      ) : (
        <div className="hist-m-list">
          {rows.map((r) => (
            <article key={r.id} className="hist-m-card">
              <div className="hist-m-card-top">
                <div>
                  <div className="hist-m-type">{r.type}</div>
                  <div className="hist-m-meta">{r.direction}</div>
                </div>
                <div className="hist-m-amt">{r.amount}</div>
              </div>
              <div className="hist-m-meta">{r.description}</div>
              <div className="hist-m-meta">{r.createdAt}</div>
            </article>
          ))}
        </div>
      )}

      <div className="hist-m-pager">
        <Button
          variant="secondary"
          type="button"
          disabled={page <= 1 || loading || !ready}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          type="button"
          disabled={page >= (pg.totalPages || 1) || loading || !ready}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
      <p className="hist-m-foot">
        Page {pg.page || page} of {pg.totalPages || 1} · {pg.total ?? 0} total
      </p>
    </div>
  );
}
