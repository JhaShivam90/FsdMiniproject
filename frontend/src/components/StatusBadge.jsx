/**
 * components/StatusBadge.jsx — Colored badge for complaint status
 */

export default function StatusBadge({ status }) {
  const config = {
    open:     { label: '⚠ Open',     cls: 'status-open' },
    assigned: { label: '🚛 Assigned', cls: 'status-assigned' },
    resolved: { label: '✓ Resolved',  cls: 'status-resolved' },
  };

  const { label, cls } = config[status] || { label: status, cls: 'status-open' };

  return <span className={`status-badge ${cls}`}>{label}</span>;
}
