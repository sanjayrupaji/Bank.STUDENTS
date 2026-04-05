import { useLayoutTier } from "../context/LayoutTierContext.jsx";
import { useTransferPage } from "../hooks/useTransferPage.js";
import { TransferMobile } from "./transfer/TransferMobile.jsx";
import { TransferTablet } from "./transfer/TransferTablet.jsx";
import { TransferDesktop } from "./transfer/TransferDesktop.jsx";
import { TransferLarge } from "./transfer/TransferLarge.jsx";

const pickProps = (h) => ({
  account: h.account,
  toAcc: h.toAcc,
  setToAcc: h.setToAcc,
  amount: h.amount,
  setAmount: h.setAmount,
  desc: h.desc,
  setDesc: h.setDesc,
  loading: h.loading,
  prepareSubmit: h.prepareSubmit,
  step: h.step,
  result: h.result,
  cancelFlow: h.cancelFlow,
  confirmTransfer: h.confirmTransfer,
  closeSuccess: h.closeSuccess,
});

export function TransferPage() {
  const tier = useLayoutTier();
  const h = useTransferPage();
  const p = pickProps(h);

  switch (tier) {
    case "mobile":
      return <TransferMobile {...p} />;
    case "tablet":
      return <TransferTablet {...p} />;
    case "large":
      return <TransferLarge {...p} />;
    case "desktop":
    default:
      return <TransferDesktop {...p} />;
  }
}
