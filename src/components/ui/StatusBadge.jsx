const statusConfig = {
  // Product
  active:     { label: 'Active',     bg: '#f0fdf4', text: '#15803d' },
  inactive:   { label: 'Inactive',   bg: '#fef2f2', text: '#dc2626' },
  draft:      { label: 'Draft',      bg: '#f8fafc', text: '#64748b' },
  // Order
  pending:    { label: 'Pending',    bg: '#fffbeb', text: '#b45309' },
  confirmed:  { label: 'Confirmed',  bg: '#eff6ff', text: '#1d4ed8' },
  packed:     { label: 'Packed',     bg: '#f5f3ff', text: '#6d28d9' },
  shipped:    { label: 'Shipped',    bg: '#eef2ff', text: '#4338ca' },
  delivered:  { label: 'Delivered',  bg: '#f0fdf4', text: '#15803d' },
  cancelled:  { label: 'Cancelled',  bg: '#fef2f2', text: '#dc2626' },
  // Coupon
  expired:    { label: 'Expired',    bg: '#fff7ed', text: '#c2410c' },
  used_up:    { label: 'Used Up',    bg: '#fef2f2', text: '#dc2626' },
}

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, bg: '#f8fafc', text: '#64748b' }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 9px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      background: config.bg,
      color: config.text,
      fontFamily: 'var(--sans)',
      letterSpacing: '0.01em',
    }}>
      {config.label}
    </span>
  )
}

export { StatusBadge }
export default StatusBadge
