/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../components/ui/PageHeader'
import { SlideOverForm } from '../../components/ui/SlideOverForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import apiService from '../../services/api'
import {
  Plus, Edit2, Trash2, Save, FileText,
  ChevronDown, ChevronUp, Eye, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

const DEFAULT_POLICIES = [
  { key: 'privacy',  title: 'Privacy Policy',         icon: '🔒', url: '/policy/privacy' },
  { key: 'terms',    title: 'Terms & Conditions',      icon: '📋', url: '/policy/terms' },
  { key: 'shipping', title: 'Shipping Policy',         icon: '🚚', url: '/shipping-policy' },
  { key: 'returns',  title: 'Returns & Refunds Policy', icon: '↩️', url: '/returns-exchange' },
]

const PolicyPage = () => {
  const [policies, setPolicies]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState(null)
  const [editing, setEditing]       = useState(null)   // { key, title, content }
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [preview, setPreview]       = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await apiService.get('/policies')
      const raw = Array.isArray(res.data) ? res.data : []
      // Merge with defaults so all 4 always appear
      const merged = DEFAULT_POLICIES.map(def => {
        const found = raw.find(p => p.key === def.key)
        return found ? { ...def, ...found } : { ...def, content: '', id: null }
      })
      // append any extra policies from DB not in defaults
      raw.forEach(p => {
        if (!DEFAULT_POLICIES.find(d => d.key === p.key)) {
          merged.push({ ...p, icon: '📄' })
        }
      })
      setPolicies(merged)
    } catch {
      setPolicies(DEFAULT_POLICIES.map(d => ({ ...d, content: '', id: null })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openEdit = (policy) => {
    setEditing({ key: policy.key, title: policy.title, content: policy.content || '' })
    setIsEditorOpen(true)
  }

  const openCreate = () => {
    setEditing({ key: '', title: '', content: '' })
    setIsEditorOpen(true)
  }

  const handleSave = async () => {
    if (!editing.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = { key: editing.key || editing.title.toLowerCase().replace(/\s+/g, '_'), title: editing.title, content: editing.content }
      const existing = policies.find(p => p.key === payload.key)
      if (existing?.id) {
        await apiService.put(`/policies/${existing.id}`, payload)
        toast.success('Policy updated — changes are now live on the website')
      } else {
        await apiService.post('/policies', payload)
        toast.success('Policy published to the website')
      }
      setIsEditorOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) {
      setPolicies(prev => prev.map(p => p.key === deleteTarget.key ? { ...p, content: '' } : p))
      setIsDeleteOpen(false)
      return
    }
    try {
      await apiService.delete(`/policies/${deleteTarget.id}`)
      toast.success('Policy deleted')
      setIsDeleteOpen(false)
      fetchData()
    } catch { toast.error('Failed to delete') }
  }

  const wordCount = (text) => text ? text.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Policy Management"
        description="Manage your store policies — changes here are reflected on the website in real time."
        actions={
          <button
            onClick={openCreate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--primary)', color: '#fff', border: 'none',
              cursor: 'pointer', fontFamily: 'var(--sans)',
            }}
          >
            <Plus size={14} /> Add Policy
          </button>
        }
      />

      {/* Status banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderRadius: 10,
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        fontSize: 12, color: '#15803d',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
        <span><strong>Live sync enabled</strong> — Edits saved here are immediately visible on your website.</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {policies.map((policy) => {
            const isExpanded = expanded === policy.key
            const hasContent = !!policy.content
            return (
              <motion.div
                key={policy.key}
                layout
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-xs)',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setExpanded(isExpanded ? null : policy.key)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 22 }}>{policy.icon || '📄'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-h)' }}>{policy.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {hasContent ? `${wordCount(policy.content)} words` : 'No content yet'}
                      {policy.url && <span style={{ marginLeft: 8, opacity: 0.7 }}>• {policy.url}</span>}
                    </div>
                  </div>

                  {/* Status pill */}
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99,
                    background: hasContent ? '#f0fdf4' : '#fef9c3',
                    color: hasContent ? '#16a34a' : '#a16207',
                  }}>
                    {hasContent ? 'Published' : 'Empty'}
                  </span>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <MiniBtn title="Edit" onClick={() => openEdit(policy)} color="var(--primary)"><Edit2 size={13} /></MiniBtn>
                    {hasContent && <MiniBtn title="Preview" onClick={() => setPreview(policy)} color="#7c3aed"><Eye size={13} /></MiniBtn>}
                    {policy.url && (
                      <MiniBtn title="View on site" onClick={() => window.open(policy.url, '_blank')} color="#0ea5e9"><ExternalLink size={13} /></MiniBtn>
                    )}
                    <MiniBtn title="Delete" onClick={() => { setDeleteTarget(policy); setIsDeleteOpen(true) }} color="#ef4444"><Trash2 size={13} /></MiniBtn>
                  </div>

                  {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>

                {/* Expandable content preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '16px 20px' }}>
                        {hasContent ? (
                          <div style={{
                            fontSize: 13, color: 'var(--text-h)', lineHeight: 1.75,
                            whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto',
                            padding: '12px 14px', background: 'var(--surface-2)',
                            borderRadius: 8,
                          }}>
                            {policy.content}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                            <FileText size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                            No content yet. Click <strong>Edit</strong> to add policy text.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Editor SlideOver — uses existing SlideOverForm for consistent UI */}
      <SlideOverForm
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editing?.key && policies.find(p => p.key === editing?.key)?.id ? 'Edit Policy' : 'Add New Policy'}
        subtitle="Changes are saved directly to the database and reflected on the website."
        size="lg"
      >
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Title input */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Policy Title *
              </label>
              <input
                value={editing.title}
                onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Privacy Policy"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  color: 'var(--text-h)', fontSize: 14, fontFamily: 'var(--sans)',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Content textarea */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Content
                </label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {wordCount(editing.content)} words
                </span>
              </div>
              <textarea
                value={editing.content}
                onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
                placeholder="Paste or type your full policy content here…"
                style={{
                  width: '100%', minHeight: 400, padding: '14px 16px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  color: 'var(--text-h)', fontSize: 13, lineHeight: 1.8,
                  fontFamily: 'var(--sans)', outline: 'none', resize: 'vertical',
                  boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setIsEditorOpen(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: 'var(--surface-3)', color: 'var(--text)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--sans)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--sans)',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={14} /> {saving ? 'Publishing…' : 'Save & Publish'}
              </button>
            </div>

            {/* Hint */}
            <div style={{
              fontSize: 11, color: 'var(--text-muted)', padding: '8px 12px',
              background: 'var(--surface-2)', borderRadius: 8, lineHeight: 1.6,
            }}>
              💡 <strong>Tip:</strong> After saving, the policy will be immediately available on your customer-facing website. You can preview it using the "View on site" button.
            </div>
          </div>
        )}
      </SlideOverForm>

      {/* Preview SlideOver */}
      <SlideOverForm
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title={preview ? `${preview.icon} ${preview.title}` : ''}
        subtitle="Preview — this is how it appears to customers."
        size="lg"
      >
        {preview && (
          <div style={{ fontSize: 13, color: 'var(--text-h)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
            {preview.content}
          </div>
        )}
      </SlideOverForm>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Policy"
        description={`Are you sure you want to delete the "${deleteTarget?.title}" policy? This will remove it from the storefront.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

const MiniBtn = ({ children, onClick, title, color }) => (
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

export default PolicyPage
