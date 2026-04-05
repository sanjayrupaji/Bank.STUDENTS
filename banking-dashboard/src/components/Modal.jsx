import { useEffect } from "react";
import "./ui.css";
import { Button } from "./Button.jsx";

export function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-head">
          <h2 id="modal-title" className="ui-modal-title">
            {title}
          </h2>
          <button type="button" className="ui-modal-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
        {footer && <div className="ui-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ModalActions({ onCancel, onConfirm, confirmLabel = "Confirm", loading }) {
  return (
    <div className="ui-modal-actions">
      <Button variant="ghost" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  );
}
