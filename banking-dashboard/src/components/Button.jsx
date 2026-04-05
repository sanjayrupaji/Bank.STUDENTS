import "./ui.css";

export function Button({
  children,
  variant = "primary",
  type = "button",
  disabled,
  loading,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn-${variant} ${className}`.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="ui-btn-spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}
