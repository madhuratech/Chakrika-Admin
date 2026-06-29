import { motion } from 'framer-motion'

const StatsCard = ({ title, value, icon, color = 'default' }) => {
  const colorMap = {
    olive:    { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a' },
    gold:     { bg: '#fffbeb', border: '#fde68a', icon: '#d97706' },
    charcoal: { bg: '#f8fafc', border: '#e2e8f0', icon: '#64748b' },
    blue:     { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb' },
    red:      { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626' },
    default:  { bg: 'var(--surface-3)', border: 'var(--border)', icon: 'var(--text)' },
  }
  const c = colorMap[color] || colorMap.default

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.16 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: 'var(--shadow-xs)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle colored top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: c.icon, opacity: 0.6, borderRadius: '12px 12px 0 0',
      }} />

      {/* Icon */}
      <div style={{
        width: 38, height: 38,
        borderRadius: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: c.icon,
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Value + Label */}
      <div>
        <div style={{
          fontSize: 26, fontWeight: 700, color: 'var(--text-h)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
          {title}
        </div>
      </div>
    </motion.div>
  )
}

export { StatsCard }
export default StatsCard
