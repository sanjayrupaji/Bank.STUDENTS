/**
 * DashboardShared — Shared constants and utilities for all dashboard layout variants.
 * Eliminates column declaration duplication across Mobile/Tablet/Desktop/Large.
 */

/** Transaction table column definitions */
export const DASHBOARD_COLUMNS = [
  { key: "type",      label: "Type"   },
  { key: "direction", label: "Dir"    },
  { key: "amount",    label: "Amount" },
  { key: "createdAt", label: "Date"   },
];

/**
 * Extract standard dashboard props from the useDashboardPage hook result.
 * Keeps each layout variant clean — just spread propsFrom(hook).
 */
export function propsFrom(h) {
  return {
    account:         h.account,
    rows:            h.rows,
    modal:           h.modal,
    setModal:        h.setModal,
    phase:           h.phase,
    amount:          h.amount,
    setAmount:       h.setAmount,
    desc:            h.desc,
    setDesc:         h.setDesc,
    busy:            h.busy,
    closeModal:      h.closeModal,
    goReview:        h.goReview,
    backToForm:      h.backToForm,
    confirmSubmit:   h.confirmSubmit,
    result:          h.result,
    flashTxId:       h.flashTxId,
    insightWeekCount: h.insightWeekCount,
  };
}
