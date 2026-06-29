import { motion } from 'framer-motion'

const EmptyState = ({ title, description, icon: Icon, iconEmoji: emoji, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: 48, height: 48,
        background: 'var(--surface-3)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        fontSize: 22,
        color: 'var(--text-muted)',
      }}>
        {Icon ? (typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof) ? <Icon size={22} strokeWidth={1.5} /> : Icon) : emoji}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5, marginBottom: action ? 20 : 0 }}>
        {description}
      </p>

      {action && action}
    </motion.div>
  )
}

export { EmptyState }
export default EmptyState
