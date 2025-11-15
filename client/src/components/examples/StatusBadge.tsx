import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <StatusBadge status="pending" />
      <StatusBadge status="bidding" />
      <StatusBadge status="executing" />
      <StatusBadge status="completed" />
      <StatusBadge status="paid" />
    </div>
  );
}
