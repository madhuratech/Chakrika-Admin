/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatsCard } from '../../components/ui/StatsCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { SlideOverForm } from '../../components/ui/SlideOverForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SearchBar } from '../../components/ui/SearchBar'
import apiService from '../../services/api'
import {
  MessageSquare, Mail, Phone, Calendar, Trash2, Eye, Send,
  CheckCircle, Clock, XCircle, Inbox, MailOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ReplyModal from './ReplyModal'

const STATUS_COLORS = {
  new:        { bg: '#eff6ff', color: '#2563eb', label: 'New'        },
  read:       { bg: '#f0fdf4', color: '#16a34a', label: 'Read'       },
  replied:    { bg: '#f5f3ff', color: '#7c3aed', label: 'Replied'    },
  closed:     { bg: '#f8fafc', color: '#64748b', label: 'Closed'     },
}

const StatusPill = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.new
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 99,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const EnquiriesPage = () => {
  const [enquiries, setEnquiries]           = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [selected, setSelected]             = useState(null)
  const [isViewOpen, setIsViewOpen]         = useState(false)
  const [isReplyOpen, setIsReplyOpen]       = useState(false)
  const [isDeleteOpen, setIsDeleteOpen]     = useState(false)
  const [deleting, setDeleting]             = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await apiService.get('/enquiries')
      setEnquiries(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const filtered = enquiries.filter(e => {
    const term = search.toLowerCase()
    const matchSearch = (e.name || '').toLowerCase().includes(term)
      || (e.email || '').toLowerCase().includes(term)
      || (e.subject || '').toLowerCase().includes(term)
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleView = async (enq) => {
    setSelected(enq)
    setIsViewOpen(true)
    // Mark as read
    if (enq.status === 'new') {
      try {
        await apiService.patch(`/enquiries/${enq.id}/status`, { status: 'read' })
        setEnquiries(prev => prev.map(e => e.id === enq.id ? { ...e, status: 'read' } : e))
      } catch { /* silent */ }
    }
  }


  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await apiService.delete(`/enquiries/${selected.id}`)
      setEnquiries(prev => prev.filter(e => e.id !== selected.id))
      toast.success('Enquiry deleted')
      setIsDeleteOpen(false)
      setIsViewOpen(false)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const stats = {
    total:   enquiries.length,
    newCnt:  enquiries.filter(e => e.status === 'new').length,
    replied: enquiries.filter(e => e.status === 'replied').length,
    closed:  enquiries.filter(e => e.status === 'closed').length,
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Enquiries"
        description="Customer messages and contact form submissions."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Enquiries"  value={stats.total}   icon={<Inbox       className="w-5 h-5" />} color="blue"     />
        <StatsCard title="New / Unread"     value={stats.newCnt}  icon={<Mail        className="w-5 h-5" />} color="gold"     />
        <StatsCard title="Replied"          value={stats.replied} icon={<MailOpen    className="w-5 h-5" />} color="olive"    />
        <StatsCard title="Closed"           value={stats.closed}  icon={<CheckCircle className="w-5 h-5" />} color="charcoal" />
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ flex: '1 1 260px' }}>
          <SearchBar placeholder="Search by name, email, subject…" value={search} onChange={setSearch} />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)',
            borderRadius: 8, background: 'var(--surface-2)',
            color: 'var(--text-h)', fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--sans)', outline: 'none',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No enquiries found" description="Customer enquiries will appear here." />
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Sender', 'Subject', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((enq, i) => (
                <motion.tr
                  key={enq.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    background: enq.status === 'new' ? 'rgba(37,99,235,0.03)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {(enq.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>{enq.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{enq.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-h)', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: enq.status === 'new' ? 600 : 400 }}>
                      {enq.subject || enq.message?.slice(0, 50) || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {fmtDate(enq.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusPill status={enq.status || 'new'} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <ActionBtn title="View" onClick={() => handleView(enq)} color="var(--primary)"><Eye size={14} /></ActionBtn>
                      <ActionBtn title="Delete" onClick={() => { setSelected(enq); setIsDeleteOpen(true) }} color="#ef4444"><Trash2 size={14} /></ActionBtn>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Drawer */}
      <SlideOverForm isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Enquiry Details" subtitle="Customer message details" size="md">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Sender info */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700,
              }}>
                {(selected.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-h)' }}>{selected.name}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} />{selected.email}</span>
                  {selected.phone && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{selected.phone}</span>}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} />{fmtDate(selected.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Subject */}
            {selected.subject && (
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Subject</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)' }}>{selected.subject}</div>
              </div>
            )}

            {/* Message */}
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Message</div>
              <div style={{ fontSize: 13, color: 'var(--text-h)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</div>
            </div>

            {/* Status changer */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Update Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_COLORS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(selected, key)}
                    style={{
                      padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${selected.status === key ? val.color : 'var(--border)'}`,
                      background: selected.status === key ? val.bg : 'transparent',
                      color: selected.status === key ? val.color : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Reply history */}
            {selected.replies?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Previous Replies ({selected.replies.length})
                </div>
                {selected.replies.map((reply, i) => (
                  <div key={reply.id} style={{
                    background: '#f5f3ff', borderRadius: 10, padding: '14px 16px',
                    borderLeft: '3px solid #7c3aed', marginBottom: 10,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>
                      {reply.subject || '(No subject)'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-h)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                      {reply.message}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      — {reply.replied_by} · {fmtDate(reply.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Send reply button */}
            <button
              onClick={() => setIsReplyOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 8,
                background: '#2563eb', color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                fontFamily: 'var(--sans)', width: 'fit-content',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Send size={16} />
              Send Reply
            </button>
            <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => { setIsViewOpen(false); setIsDeleteOpen(true) }}
                style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                <Trash2 size={12} style={{ display: 'inline', marginRight: 4 }} /> Delete
              </button>
            </div>
          </div>
        )}
      </SlideOverForm>

      <ReplyModal
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        enquiry={selected}
        onReplied={fetch}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Enquiry"
        description={`Are you sure you want to delete this enquiry from ${selected?.name}? This cannot be undone.`}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

const ActionBtn = ({ children, onClick, title, color }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 28, height: 28, borderRadius: 7,
      border: '1px solid var(--border)',
      background: 'transparent', color: 'var(--text-muted)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color; e.currentTarget.style.background = color + '12' }}
    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
  >
    {children}
  </button>
)

export default EnquiriesPage
