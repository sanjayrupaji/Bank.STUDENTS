import "./ui.css";

/**
 * Material Design 3 Card
 *
 * @param {string}    variant     - "elevated" | "filled" | "outline" | "flat"
 * @param {boolean}   interactive - Enables hover/press state layers + pointer cursor
 * @param {ReactNode} icon        - Optional leading icon (emoji, SVG, or component)
 * @param {string}    title       - Card title
 * @param {string}    subtitle    - Card subtitle / supporting text
 * @param {ReactNode} actions     - Optional action area rendered at the bottom
 * @param {ReactNode} children    - Card body content
 * @param {string}    className   - Extra class names
 * @param {function}  onClick     - Click handler (auto-enables interactive mode)
 */
export function Card({
  title,
  subtitle,
  children,
  className = "",
  variant = "elevated",
  interactive = false,
  icon = null,
  actions = null,
  onClick,
}) {
  const variantClass =
    variant === "filled"
      ? "ui-card--filled"
      : variant === "flat"
      ? "ui-card--flat"
      : variant === "outline"
      ? "ui-card--outline"
      : "ui-card--elevated";

  const isInteractive = interactive || !!onClick;

  return (
    <div
      className={`ui-card ${variantClass}${isInteractive ? " ui-card--interactive" : ""} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {(title || subtitle || icon) && (
        <div className="ui-card-head">
          {icon && <span className="ui-card-head-icon">{icon}</span>}
          <div className="ui-card-head-text">
            {title && <h2 className="ui-card-title">{title}</h2>}
            {subtitle && <p className="ui-card-sub">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="ui-card-body">{children}</div>
      {actions && <div className="ui-card-actions">{actions}</div>}
    </div>
  );
}
