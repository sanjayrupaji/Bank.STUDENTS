export function getPageMeta(pathname) {
  if (pathname.startsWith("/admin")) {
    return { crumb: "Platform", title: "Admin console" };
  }
  if (pathname.startsWith("/transfer")) {
    return { crumb: "Payments", title: "Transfer" };
  }
  if (pathname.startsWith("/history")) {
    return { crumb: "Accounts", title: "Transaction history" };
  }
  return { crumb: "Accounts", title: "Overview" };
}
