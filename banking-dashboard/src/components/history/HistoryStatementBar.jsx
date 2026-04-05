import "./history-statement-bar.css";

export function HistoryStatementBar({
  typeFilter,
  setTypeFilter,
  rangePreset,
  setRangePreset,
  statementSummary,
  filterHint,
  txTypeOptions,
}) {
  return (
    <div className="hist-bar" role="region" aria-label="Statement filters">
      <div className="hist-bar-row">
        <div className="hist-bar-field">
          <label className="hist-bar-label" htmlFor="hist-range">
            Date range
          </label>
          <select
            id="hist-range"
            className="hist-bar-select"
            value={rangePreset}
            onChange={(e) => setRangePreset(e.target.value)}
          >
            <option value="all">All on page</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
        <div className="hist-bar-field">
          <label className="hist-bar-label" htmlFor="hist-type">
            Type
          </label>
          <select
            id="hist-type"
            className="hist-bar-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {txTypeOptions.map((x) => (
              <option key={x || "all"} value={x}>
                {x || "All types"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="hist-bar-summary">
        <div className="hist-bar-pill">
          <span className="hist-bar-pill-k">Deposits</span>
          <span className="hist-bar-pill-v">₹{statementSummary.deposits}</span>
        </div>
        <div className="hist-bar-pill hist-bar-pill-out">
          <span className="hist-bar-pill-k">Withdrawals</span>
          <span className="hist-bar-pill-v">₹{statementSummary.withdrawals}</span>
        </div>
      </div>
      <p className="hist-bar-hint">{filterHint}</p>
    </div>
  );
}
