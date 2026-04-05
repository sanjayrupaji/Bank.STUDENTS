import { useLayoutTier } from "../context/LayoutTierContext.jsx";
import { useHistoryPage } from "../hooks/useHistoryPage.js";
import { HistoryMobile } from "./history/HistoryMobile.jsx";
import { HistoryTablet } from "./history/HistoryTablet.jsx";
import { HistoryDesktop } from "./history/HistoryDesktop.jsx";
import { HistoryLarge } from "./history/HistoryLarge.jsx";

export function HistoryPage() {
  const tier = useLayoutTier();
  const h = useHistoryPage();

  const common = {
    ready: h.ready,
    loading: h.loading,
    page: h.page,
    setPage: h.setPage,
    rows: h.rows,
    pg: h.pg,
    typeFilter: h.typeFilter,
    setTypeFilter: h.setTypeFilter,
    rangePreset: h.rangePreset,
    setRangePreset: h.setRangePreset,
    statementSummary: h.statementSummary,
    txTypeOptions: h.txTypeOptions,
    filterHint: h.filterHint,
  };

  switch (tier) {
    case "mobile":
      return <HistoryMobile {...common} />;
    case "tablet":
      return <HistoryTablet {...common} columns={h.columns} />;
    case "large":
      return <HistoryLarge {...common} columns={h.columns} />;
    case "desktop":
    default:
      return <HistoryDesktop {...common} columns={h.columns} />;
  }
}
