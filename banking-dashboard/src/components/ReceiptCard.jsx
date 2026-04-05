import "./receipt-card.css";

export function ReceiptCard({ transaction, userLabel, accountNumber }) {
  if (!transaction) return null;
  const when = transaction.createdAt
    ? new Date(transaction.createdAt).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="receipt-card">
      <div className="receipt-card-brand">Core Banking</div>
      <div className="receipt-card-type">{transaction.type}</div>
      <div className="receipt-card-amount">₹{transaction.amount}</div>
      <dl className="receipt-card-dl">
        <div>
          <dt>Transaction ID</dt>
          <dd>
            <code>{transaction.id}</code>
          </dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{when}</dd>
        </div>
        {userLabel ? (
          <div>
            <dt>Account holder</dt>
            <dd>{userLabel}</dd>
          </div>
        ) : null}
        {accountNumber ? (
          <div>
            <dt>Account</dt>
            <dd className="receipt-card-mono">{accountNumber}</dd>
          </div>
        ) : null}
        {transaction.description ? (
          <div>
            <dt>Note</dt>
            <dd>{transaction.description}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
