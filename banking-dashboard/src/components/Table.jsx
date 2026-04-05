import "./ui.css";

export function Table({ columns, rows, empty, rowClassName }) {
  if (!rows.length) {
    return (
      <div className="ui-table-empty">
        <p>{empty || "No records"}</p>
      </div>
    );
  }

  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              className={typeof rowClassName === "function" ? rowClassName(row) : undefined}
            >
              {columns.map((c) => (
                <td key={c.key}>{row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
