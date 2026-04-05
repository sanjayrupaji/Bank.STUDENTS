import { useCallback, useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import "./copy-text-button.css";

export function CopyTextButton({ text, label = "Copy", className = "", compact = false }) {
  const { showToast } = useToast();
  const [done, setDone] = useState(false);

  const onClick = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard", "success");
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      showToast("Could not copy", "error");
    }
  }, [text, showToast]);

  return (
    <button
      type="button"
      className={`copy-text-btn${compact ? " copy-text-btn--compact" : ""} ${className}`.trim()}
      onClick={onClick}
      disabled={!text}
      title={`Copy ${label}`}
      aria-label={`Copy ${label} to clipboard`}
    >
      <span className="copy-text-btn__ico" aria-hidden>
        {done ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      {!compact ? <span className="copy-text-btn__txt">{done ? "Copied" : label}</span> : null}
    </button>
  );
}
