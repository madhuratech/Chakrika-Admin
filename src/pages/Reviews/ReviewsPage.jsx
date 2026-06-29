/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../../components/ui/PageHeader'

import { EmptyState } from '../../components/ui/EmptyState'
import { SlideOverForm } from '../../components/ui/SlideOverForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SearchBar } from '../../components/ui/SearchBar'
import apiService from '../../services/api'
import {
  Star, Trash2, Eye, CheckCircle, XCircle,
  ThumbsUp, ThumbsDown, MessageSquare, Package,
} from 'lucide-react'
import toast from 'react-hot-toast'

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ display: 'inline-flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i} size={size}
        fill={i <= rating ? '#f59e0b' : 'none'}
        color={i <= rating ? '#f59e0b' : 'var(--border)'}
      />
    ))}
  </span>
)

const STATUS_MAP = {
  pending:  { bg: '#fffbeb', color: '#d97706', label: 'Pending'  },
  approved: { bg: '#f0fdf4', color: '#16a34a', label: 'Approved' },
  rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
}

const ReviewsPage = () => {
  const [reviews, setReviews]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [selected, setSelected]         = useState(null)
  const [isViewOpen, setIsViewOpen]     = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await apiService.get('/reviews')
      setReviews(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const filtered = reviews.filter(r => {
    const term = search.toLowerCase()
    const matchSearch = (r.customer_name || r.name || '').toLowerCase().includes(term)
      || (r.product_name || '').toLowerCase().includes(term)
      || (r.comment || '').toLowerCase().includes(term)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchRating = ratingFilter === 'all' || String(r.rating) === ratingFilter
    return matchSearch && matchStatus && matchRating
  })

  const handleApprove = async (review) => {
    try {
      await apiService.patch(`/reviews/${review.id}/status`, { status: 'approved' })
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'approved' } : r))
      if (selected?.id === review.id) setSelected(p => ({ ...p, status: 'approved' }))
      toast.success('Review approved')
    } catch { toast.error('Failed to update') }
  }

  const handleReject = async (review) => {
    try {
      await apiService.patch(`/reviews/${review.id}/status`, { status: 'rejected' })
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'rejected' } : r))
      if (selected?.id === review.id) setSelected(p => ({ ...p, status: 'rejected' }))
      toast.success('Review rejected')
    } catch { toast.error('Failed to update') }
  }

  const confirmDelete = async () => {
    try {
      await apiService.delete(`/reviews/${selected.id}`)
      setReviews(prev => prev.filter(r => r.id !== selected.id))
      toast.success('Review deleted')
      setIsDeleteOpen(false)
      setIsViewOpen(false)
    } catch { toast.error('Failed to delete') }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reviews"
        description="Customer product reviews and ratings — moderate before they appear on the storefront."
      />


      {/* Filters */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ flex: '1 1 260px' }}>
          <SearchBar placeholder="Search by customer, product, comment…" value={search} onChange={setSearch} />
        </div>
        {[
          { value: statusFilter, onChange: setStatusFilter, options: [['all','All Statuses'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']] },
          { value: ratingFilter, onChange: setRatingFilter, options: [['all','All Ratings'],['5','★★★★★'],['4','★★★★'],['3','★★★'],['2','★★'],['1','★']] },
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)} style={{
            padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8,
            background: 'var(--surface-2)', color: 'var(--text-h)', fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--sans)', outline: 'none',
          }}>
            {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Star} title="No reviews found" description="Customer reviews will appear here." />
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Customer', 'Product', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rev, i) => {
                const s = STATUS_MAP[rev.status] || STATUS_MAP.pending
                return (
                  <motion.tr
                    key={rev.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>{rev.customer_name || rev.name || 'Anonymous'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rev.email || ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {rev.product_thumbnail && (
                          <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                            <img src={rev.product_thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--text-h)', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rev.product_name || '—'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}><StarRating rating={rev.rating} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rev.comment || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(rev.created_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <ActionBtn title="View" onClick={() => { setSelected(rev); setIsViewOpen(true) }} color="var(--primary)"><Eye size={13} /></ActionBtn>
                        {rev.status !== 'approved' && <ActionBtn title="Approve" onClick={() => handleApprove(rev)} color="#16a34a"><CheckCircle size={13} /></ActionBtn>}
                        {rev.status !== 'rejected' && <ActionBtn title="Reject"  onClick={() => handleReject(rev)}  color="#dc2626"><XCircle size={13} /></ActionBtn>}
                        <ActionBtn title="Delete"  onClick={() => { setSelected(rev); setIsDeleteOpen(true) }} color="#ef4444"><Trash2 size={13} /></ActionBtn>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Drawer */}
      <SlideOverForm isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Review Details" subtitle="Full review content" size="md">
        {selected && (() => {
          const s = STATUS_MAP[selected.status] || STATUS_MAP.pending
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                  {(selected.customer_name || selected.name || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-h)' }}>{selected.customer_name || selected.name || 'Anonymous'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(selected.created_at)}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: s.bg, color: s.color }}>{s.label}</span>
              </div>

              <StarRating rating={selected.rating} size={18} />

              {selected.product_name && (
                <div style={{ background: 'var(--surface-2)', borderRadius: 9, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Package size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--text-h)' }}>{selected.product_name}</span>
                </div>
              )}

              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Review</div>
                <div style={{ fontSize: 13, color: 'var(--text-h)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.comment || '—'}</div>
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                {selected.status !== 'approved' && (
                  <button onClick={() => handleApprove(selected)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                    ✓ Approve
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button onClick={() => handleReject(selected)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                    ✕ Reject
                  </button>
                )}
                <button onClick={() => { setIsViewOpen(false); setIsDeleteOpen(true) }} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                  Delete
                </button>
              </div>
            </div>
          )
        })()}
      </SlideOverForm>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        description="Are you sure you want to permanently delete this review?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

const ActionBtn = ({ children, onClick, title, color }) => (
  <button onClick={onClick} title={title} style={{
    width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
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

export default ReviewsPage
