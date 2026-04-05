import "./skeleton.css";

export function Skeleton({ className = "", style }) {
  return <div className={`skel ${className}`.trim()} style={style} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="skel-card">
      <Skeleton className="skel-line skel-w40" />
      <Skeleton className="skel-line skel-w70" style={{ marginTop: 12 }} />
      <Skeleton className="skel-line skel-w90" style={{ marginTop: 10 }} />
    </div>
  );
}
