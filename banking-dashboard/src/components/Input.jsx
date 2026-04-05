import "./ui.css";

export function Input({ label, error, id, className = "", ...rest }) {
  const nid = id || rest.name;
  return (
    <div className={`ui-field ${className}`.trim()}>
      {label && (
        <label className="ui-label" htmlFor={nid}>
          {label}
        </label>
      )}
      <input className={`ui-input ${error ? "ui-input-error" : ""}`} id={nid} {...rest} />
      {error && <span className="ui-error">{error}</span>}
    </div>
  );
}
