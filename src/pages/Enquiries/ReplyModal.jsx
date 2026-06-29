import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import apiService from '../../services/api'

const ReplyModal = ({ isOpen, onClose, enquiry, onReplied }) => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (isOpen && enquiry) {
      setSubject(`Re: ${enquiry.subject || 'Contact Form Enquiry'}`)
      setMessage('')
    }
  }, [isOpen, enquiry])

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    setSending(true)
    try {
      await apiService.post(`/enquiries/${enquiry.id}/reply`, { subject, message })
      toast.success('Reply sent successfully.')
      onReplied?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.25)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              width: '100%', maxWidth: 560, position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column', maxHeight: '85vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>Send Reply</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Compose your email reply</p>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, border: 'none', borderRadius: 8,
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  To
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  fontSize: 13, color: 'var(--text)',
                }}>
                  <Mail size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                  {enquiry?.email || '—'}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--surface-2)',
                    color: 'var(--text-h)', fontSize: 13, fontFamily: 'var(--sans)',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  placeholder="Email subject"
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Reply Message
                  <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>
                    ({message.length} chars)
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{
                    width: '100%', minHeight: 160, padding: '10px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--surface-2)',
                    color: 'var(--text-h)', fontSize: 13, fontFamily: 'var(--sans)',
                    lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  placeholder="Type your reply here..."
                />
              </div>
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 18px', border: '1px solid var(--border)',
                  borderRadius: 10, background: 'transparent', color: 'var(--text)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-h)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                style={{
                  padding: '10px 20px', border: 'none', borderRadius: 10,
                  background: !message.trim() ? 'var(--text-muted)' : '#2563eb',
                  color: '#fff', fontSize: 13, fontWeight: 500, cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--sans)', display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'opacity 0.15s', opacity: sending ? 0.8 : 1,
                }}
                onMouseEnter={e => { if (!sending && message.trim()) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { if (!sending) e.currentTarget.style.opacity = '1' }}
              >
                {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ReplyModal
