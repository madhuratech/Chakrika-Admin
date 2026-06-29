import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Circle, Clock } from 'lucide-react'
import apiService from '../../services/api'

const LIFECYCLE = [
  { key: 'pending',     label: 'Pending' },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'processing',  label: 'Processing' },
  { key: 'shipped',     label: 'Shipped' },
  { key: 'in_transit',  label: 'In Transit' },
  { key: 'delivered',   label: 'Delivered' },
]

const TimelineModal = ({ isOpen, onClose, order }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !order) return
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await apiService.get(`/orders/${order.id}/history`)
        setHistory(res.data || [])
      } catch {
        setHistory([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [isOpen, order])

  // Build a map of status -> history entry
  const statusMap = {}
  for (const entry of history) {
    statusMap[entry.new_status] = entry
  }

  // Find which step is current (the highest completed in lifecycle)
  const currentStatus = order?.orderStatus || ''
  const currentIdx = LIFECYCLE.findIndex(s => s.key === currentStatus)

  const formatDt = (dt) => {
    if (!dt) return ''
    const d = new Date(dt)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.25)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              position: 'relative',
              zIndex: 10,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
                  Order Timeline
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  #{order?.order_number || order?.id || ''}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '28px', height: '28px', border: 'none', borderRadius: '8px',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                  flexShrink: 0, transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X size={14} />
              </button>
            </div>

            {/* Timeline */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                Loading timeline...
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {LIFECYCLE.map((step, idx) => {
                  const entry = statusMap[step.key]
                  const isCompleted = entry && entry.new_status === step.key
                  const isCurrent = idx === currentIdx && !isCompleted
                  const isPast = idx < currentIdx

                  let circleBg = '#e5e7eb'
                  let circleColor = '#9ca3af'
                  let icon = null
                  if (isCompleted || isPast) {
                    circleBg = '#16a34a'
                    circleColor = '#fff'
                    icon = <Check size={12} strokeWidth={3} />
                  } else if (isCurrent) {
                    circleBg = '#f59e0b'
                    circleColor = '#fff'
                    icon = <Circle size={10} strokeWidth={2} />
                  } else {
                    circleBg = '#f3f4f6'
                    circleColor = '#d1d5db'
                    icon = <Circle size={10} strokeWidth={1} />
                  }

                  return (
                    <div key={step.key} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: idx < LIFECYCLE.length - 1 ? '8px' : '0' }}>
                      {/* Vertical line */}
                      {idx < LIFECYCLE.length - 1 && (
                        <div style={{
                          position: 'absolute', left: '11px', top: '28px',
                          width: '2px', height: 'calc(100% - 8px)',
                          background: isPast ? '#16a34a' : '#e5e7eb',
                        }} />
                      )}
                      {/* Circle */}
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: circleBg, color: circleColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, position: 'relative', zIndex: 1,
                        transition: 'all 0.2s',
                      }}>
                        {icon}
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, paddingBottom: '12px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: isCompleted || isPast ? '#16a34a' : isCurrent ? '#d97706' : 'var(--text-muted)' }}>
                          {step.label}
                        </div>
                        {entry && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {formatDt(entry.created_at)}
                          </div>
                        )}
                        {entry?.remarks && (
                          <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px', fontStyle: 'italic' }}>
                            {entry.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { TimelineModal }
export default TimelineModal
