/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import apiService from '../../services/api'
import {
  Package, Users, DollarSign, ShoppingCart,
  ArrowRight, AlertTriangle, TrendingUp, ArrowUpRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ── Gradient palette for hero cards ─── */
const GRADIENTS = [
  { from: '#4ade80', to: '#16a34a' },
  { from: '#60a5fa', to: '#2563eb' },
  { from: '#a78bfa', to: '#7c3aed' },
  { from: '#fb923c', to: '#ea580c' },
]

/* ── Filter pill component ─────────────── */
const FilterPills = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          border: '1px solid',
          borderColor: value === opt.value ? 'var(--primary)' : 'var(--border)',
          background: value === opt.value ? 'var(--primary)' : 'transparent',
          color: value === opt.value ? '#fff' : 'var(--text-muted)',
          cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: 'var(--sans)',
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

const RANGE_OPTIONS = [
  { label: 'Day',   value: 'day'   },
  { label: 'Week',  value: 'week'  },
  { label: 'Month', value: 'month' },
  { label: 'Year',  value: 'year'  },
]

const MONTH_OPTIONS = [
  { label: 'Jan', value: 1 }, { label: 'Feb', value: 2 }, { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 }, { label: 'May', value: 5 }, { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 }, { label: 'Aug', value: 8 }, { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 }, { label: 'Nov', value: 11 }, { label: 'Dec', value: 12 },
]

const DashboardPage = () => {
  const navigate = useNavigate()
  const [stats, setStats]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [hoveredPieIndex, setHoveredPieIndex] = useState(null)

  // Chart state
  const [chartRange, setChartRange]     = useState('month')
  const [chartData, setChartData]       = useState([])
  const [chartLoading, setChartLoading] = useState(false)

  // Category pie state
  const now = new Date()
  const [pieMonth, setPieMonth]         = useState(now.getMonth() + 1)
  const [pieYear, setPieYear]           = useState(now.getFullYear())
  const [pieData, setPieData]           = useState([])
  const [pieLoading, setPieLoading]     = useState(false)

  /* ── Fetch dashboard stats ───── */
  const fetchDashboard = async () => {
    try {
      const response = await apiService.get('/dashboard')
      setStats(response.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  /* ── Fetch chart data ─────────── */
  const fetchChart = useCallback(async () => {
    setChartLoading(true)
    try {
      const res = await apiService.get(`/dashboard/chart?range=${chartRange}`)
      setChartData(res.data || [])
    } catch {
      toast.error('Failed to load chart data')
    } finally {
      setChartLoading(false)
    }
  }, [chartRange])

  /* ── Fetch category pie data ─── */
  const fetchCategories = useCallback(async () => {
    setPieLoading(true)
    try {
      const res = await apiService.get(`/dashboard/categories?month=${pieMonth}&year=${pieYear}`)
      setPieData(res.data || [])
    } catch {
      toast.error('Failed to load category data')
    } finally {
      setPieLoading(false)
    }
  }, [pieMonth, pieYear])

  useEffect(() => { fetchDashboard() }, [])
  useEffect(() => { fetchChart()     }, [fetchChart])
  useEffect(() => { fetchCategories()}, [fetchCategories])

  const fmt = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

  const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  /* ── Loading skeleton ─────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 14, height: 96,
              animation: 'skeleton-pulse 1.4s ease-in-out infinite',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, height: 260,
              animation: 'skeleton-pulse 1.4s ease-in-out infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
      </div>
    )
  }

  /* ── Derived data ──────────────── */
  const recentOrders     = (stats?.recentOrders || []).slice(0, 5)
  const allProducts      = stats?.allProducts   || []
  const lowStockProducts = allProducts.filter(p => (p.stock ?? p.quantity ?? 0) <= 10)

  const heroCards = [
    { label: 'Revenue',          value: fmt(stats?.totalRevenue),    sub: `${stats?.totalOrders ?? 0} orders`,        icon: DollarSign,  gradient: GRADIENTS[0] },
    { label: 'Active Orders',    value: stats?.pendingOrders ?? 0,   sub: `${stats?.totalOrders ?? 0} total`,         icon: ShoppingCart, gradient: GRADIENTS[1] },
    { label: 'Total Products',   value: stats?.totalProducts ?? 0,   sub: `${stats?.totalCollections ?? 0} collections`, icon: Package,  gradient: GRADIENTS[2] },
    { label: 'Registered Users', value: stats?.totalCustomers ?? 0,  sub: 'Total customers',                          icon: Users,       gradient: GRADIENTS[3] },
  ]

  /* ── Line chart helpers ─────────── */
  const PIE_COLORS = ['var(--primary)', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899']
  const activePieData = pieData
    .filter(d => d.revenue > 0 || d.totalSales > 0)
    .slice(0, 7)
    .map((d, i) => ({ ...d, color: PIE_COLORS[i % PIE_COLORS.length], value: Number(d.revenue) || Number(d.totalSales) || 1 }))

  const totalPieVal = activePieData.reduce((s, d) => s + d.value, 0)
  const pieNorm = activePieData.map(d => ({ ...d, pct: totalPieVal > 0 ? Math.round((d.value / totalPieVal) * 100) : 0 }))

  // Build donut slices
  let accAngle = 0
  const R = 68, CX = 100, CY = 100
  const slices = pieNorm.map(item => {
    const angle = Math.max((item.pct / 100) * 360, 0.01)
    const x1 = CX + R * Math.cos((accAngle - 90) * Math.PI / 180)
    const y1 = CY + R * Math.sin((accAngle - 90) * Math.PI / 180)
    accAngle += angle
    const x2 = CX + R * Math.cos((accAngle - 90) * Math.PI / 180)
    const y2 = CY + R * Math.sin((accAngle - 90) * Math.PI / 180)
    return { ...item, x1, y1, x2, y2, largeArc: item.pct > 50 ? 1 : 0 }
  })

  // SVG line chart path from real chart data
  const buildLinePath = (data, W = 600, H = 120) => {
    if (!data || data.length < 2) return { d: '', area: '', points: [] }
    const vals = data.map(d => Number(d.revenue) || 0)
    const maxV = Math.max(...vals, 1)
    const points = vals.map((v, i) => ({
      x: (i / (vals.length - 1)) * (W - 20) + 10,
      y: H - 16 - ((v / maxV) * (H - 32)),
    }))
    const smooth = points.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = points[i - 1]
      const cpx = (prev.x + p.x) / 2
      return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`
    }).join(' ')
    const area = smooth + ` L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
    return { d: smooth, area, points }
  }
  const { d: linePath, area: areaPath, points: linePoints } = buildLinePath(chartData)

  /* ── Render ──────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ───────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-h)', margin: 0, lineHeight: 1.2 }}>
            Dashboard 👋
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Live overview of your business performance.
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
        }}>
          <TrendingUp size={12} /> Live data
        </div>
      </div>

      {/* ── Hero Stat Cards — minimal horizontal strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {heroCards.map(({ label, value, sub, icon: Icon, gradient }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
              borderRadius: 14, padding: '16px 18px',
              color: '#fff', position: 'relative', overflow: 'hidden',
              boxShadow: `0 4px 18px ${gradient.to}33`,
            }}
          >
            {/* bg circle */}
            <div style={{
              position: 'absolute', top: -14, right: -14,
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.14)',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(255,255,255,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="#fff" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, opacity: 0.85 }}>
                <ArrowUpRight size={11} /> <span>{sub}</span>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Middle Row: Recent Orders + Low Stock ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 14 }}>

        {/* Recent Orders – max 5 */}
        <Card
          title="Recent Orders"
          subtitle={`Showing latest ${Math.min(recentOrders.length, 5)} orders`}
          action={{ label: 'View All', onClick: () => navigate('/orders') }}
        >
          {recentOrders.length > 0 ? (
            <div>
              {recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 0',
                    borderBottom: i < recentOrders.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/orders')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={avatarStyle}>
                      {(order.customer_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>
                        {order.customer_name || 'Guest'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        #{order.order_number} · {fmtDate(order.created_at)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>{fmt(order.total_amount)}</div>
                    <StatusBadge status={order.order_status} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} title="No recent orders" description="Orders will appear here once customers start purchasing." />
          )}
        </Card>

        {/* Low Stock Alert – max 6 */}
        <LowStockAlert products={lowStockProducts.slice(0, 6)} total={lowStockProducts.length} onNavigate={() => navigate('/collections')} />
      </div>

      {/* ── Bottom Row: Line Chart + Donut ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: 14 }}>

        {/* Line Chart with filter */}
        <Card
          title="Revenue Trend"
          subtitle={chartLoading ? 'Loading…' : `${chartData.length} data point${chartData.length !== 1 ? 's' : ''}`}
          action={<FilterPills options={RANGE_OPTIONS} value={chartRange} onChange={setChartRange} />}
        >
          {chartData.length > 0 ? (
            <div style={{ position: 'relative', height: 180, marginTop: 4 }}>
              <svg width="100%" height="160" viewBox="0 0 620 130" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[25, 55, 85, 110].map(y => (
                  <line key={y} x1="10" y1={y} x2="610" y2={y} stroke="var(--border)" strokeDasharray="4 4" strokeWidth="0.8" opacity="0.5" />
                ))}
                {/* Area */}
                {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
                {/* Line */}
                {linePath && (
                  <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {/* Data points */}
                {linePoints.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
                ))}
              </svg>
              {/* X labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingLeft: 6, paddingRight: 6 }}>
                {chartData.map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {chartLoading ? 'Loading chart…' : 'No data for this period'}
            </div>
          )}
        </Card>

        {/* Donut Chart with month + year filter */}
        <Card
          title="Category Sales"
          subtitle={`Total sales by collection · ${MONTH_OPTIONS[pieMonth - 1]?.label} ${pieYear}`}
          action={
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={pieMonth}
                onChange={e => setPieMonth(Number(e.target.value))}
                style={selectStyle}
              >
                {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select
                value={pieYear}
                onChange={e => setPieYear(Number(e.target.value))}
                style={selectStyle}
              >
                {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          }
        >
          {pieLoading ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading…
            </div>
          ) : pieNorm.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'space-around', flexWrap: 'wrap', minHeight: 200 }}>
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
                <svg width="160" height="160" viewBox="0 0 200 200">
                  {slices.map((item, index) => (
                    <path
                      key={item.name}
                      d={`M ${CX} ${CY} L ${item.x1} ${item.y1} A ${R} ${R} 0 ${item.largeArc} 1 ${item.x2} ${item.y2} Z`}
                      fill={item.color}
                      stroke="var(--surface)"
                      strokeWidth={hoveredPieIndex === index ? 4 : 1.5}
                      style={{
                        cursor: 'pointer',
                        transform: hoveredPieIndex === index ? 'scale(1.06)' : 'scale(1)',
                        transformOrigin: '100px 100px',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={() => setHoveredPieIndex(index)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    />
                  ))}
                  <circle cx="100" cy="100" r="42" fill="var(--surface)" />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5 }}>Sales</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)' }}>
                    {fmt(pieNorm.reduce((s, d) => s + d.value, 0))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 130 }}>
                {pieNorm.map((item, index) => (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '4px 8px', borderRadius: 7,
                      background: hoveredPieIndex === index ? 'var(--surface-3)' : 'transparent',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={() => setHoveredPieIndex(index)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-h)', fontWeight: hoveredPieIndex === index ? 600 : 400 }}>
                        {item.name}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-h)' }}>{item.pct}%</span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.totalSales || 0} sales</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No sales data for this period
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ── Reusable Card ─────────────────────────────────────────────────── */
const Card = ({ title, subtitle, children, action }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '18px 20px',
    boxShadow: 'var(--shadow-xs)',
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-h)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && (
        typeof action === 'object' && action.label ? (
          <button onClick={action.onClick} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
            fontSize: 11, fontWeight: 600, color: 'var(--primary)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--sans)', padding: '3px 6px',
            borderRadius: 6, transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {action.label} <ArrowRight size={11} />
          </button>
        ) : action
      )}
    </div>
    {children}
  </div>
)

/* ── Low Stock Alert ───────────────────────────────────────────────── */
const LowStockAlert = ({ products, total, onNavigate }) => {
  if (!products || products.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '18px 20px',
        background: 'rgba(22, 163, 74, 0.08)',
        border: '1px solid rgba(22, 163, 74, 0.25)',
        borderRadius: 14, boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(22, 163, 74, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#16a34a',
        }}>
          <AlertTriangle size={17} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>All Stock Levels Healthy</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>No products are running low on stock.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px',
      boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'rgba(217, 119, 6, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#d97706',
          }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-h)' }}>Low Stock Alert</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {total} {total === 1 ? 'product' : 'products'} with ≤ 10 units
            </div>
          </div>
        </div>
        <button
          onClick={onNavigate}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 600, color: '#d97706',
            background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: 6, cursor: 'pointer', padding: '4px 10px',
            fontFamily: 'var(--sans)', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)'}
        >
          Manage <ArrowRight size={10} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {products.map((product, i) => {
          const stock = product.stock ?? product.quantity ?? 0
          const isCritical = stock <= 3
          return (
            <div key={product.id ?? i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              background: isCritical ? 'rgba(220, 38, 38, 0.06)' : 'rgba(217, 119, 6, 0.05)',
              border: `1px solid ${isCritical ? 'rgba(220,38,38,0.18)' : 'rgba(217,119,6,0.18)'}`,
              borderRadius: 9,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, overflow: 'hidden',
                background: 'var(--surface-3)', flexShrink: 0,
              }}>
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={12} color="var(--text-muted)" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.name}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: isCritical ? '#dc2626' : '#d97706',
                background: isCritical ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                padding: '2px 8px', borderRadius: 5, whiteSpace: 'nowrap',
              }}>
                {stock} left
              </div>
            </div>
          )
        })}
        {total > 6 && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 2 }}>
            +{total - 6} more low-stock products
          </div>
        )}
      </div>
    </div>
  )
}

const avatarStyle = {
  width: 30, height: 30,
  background: 'var(--primary-light)',
  borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 11, fontWeight: 700,
  color: 'var(--primary)',
  flexShrink: 0,
}

const selectStyle = {
  padding: '3px 6px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--surface-2)',
  color: 'var(--text-h)',
  fontSize: 11,
  fontFamily: 'var(--sans)',
  cursor: 'pointer',
  outline: 'none',
}

export default DashboardPage
