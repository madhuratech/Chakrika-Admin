import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Calendar,
  ChevronDown,
  ShoppingBag,
  ArrowUpRight,
} from 'lucide-react'

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('This Month')
  const [hoveredPieIndex, setHoveredPieIndex] = useState(null)

  // Mock data for graphs
  const categorySales = [
    { name: 'Kanjivaram Silk', value: 45, color: 'var(--primary)', amount: 225000 },
    { name: 'Banarasi Silk', value: 30, color: 'var(--color-champagne-gold, #D8C08A)', amount: 150000 },
    { name: 'Cotton Heritage', value: 15, color: 'var(--color-royal-teal, #103F46)', amount: 75000 },
    { name: 'Art Silks', value: 10, color: 'var(--color-forest-depth, #093B33)', amount: 50000 },
  ]

  const monthlySales = [
    { label: 'Jan', value: 120000 },
    { label: 'Feb', value: 150000 },
    { label: 'Mar', value: 180000 },
    { label: 'Apr', value: 220000 },
    { label: 'May', value: 300000 },
    { label: 'Jun', value: 500000 },
  ]

  const trendData = [
    { day: 'Mon', value: 30 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 40 },
    { day: 'Thu', value: 65 },
    { day: 'Fri', value: 55 },
    { day: 'Sat', value: 80 },
    { day: 'Sun', value: 95 },
  ]

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  // Calculations for SVG Pie Chart
  let accumulatedAngle = 0
  const radius = 70
  const center = 100
  const totalAmount = categorySales.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <PageHeader
        title="Analytics & Reports"
        description="Detailed insights into store sales, product preferences, and conversions."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={dropdownBtn}>
              <Calendar size={14} />
              <span>{timeRange}</span>
              <ChevronDown size={14} />
            </div>
          </div>
        }
      />

      {/* Analytics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        <div style={statBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Average Order Value</span>
            <div style={iconWrapper}><DollarSign size={16} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-h)' }}>{formatCurrency(8450)}</div>
          <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <ArrowUpRight size={14} />
            <span>+4.2% from last month</span>
          </div>
        </div>

        <div style={statBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Conversion Rate</span>
            <div style={iconWrapper}><Percent size={16} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-h)' }}>3.42%</div>
          <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <ArrowUpRight size={14} />
            <span>+1.1% from last week</span>
          </div>
        </div>

        <div style={statBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Store Sessions</span>
            <div style={iconWrapper}><Users size={16} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-h)' }}>45,210</div>
          <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <ArrowUpRight size={14} />
            <span>+18.5% traffic growth</span>
          </div>
        </div>

        <div style={statBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Sells</span>
            <div style={iconWrapper}><ShoppingBag size={16} /></div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-h)' }}>2,480 units</div>
          <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <ArrowUpRight size={14} />
            <span>+12.4% sales volume</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        
        {/* Category Sales Pie Graph */}
        <div style={chartCard}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-h)' }}>Category Distribution</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Share of sales across major saree collections</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', alignItems: 'center', gap: 28, justifyContent: 'space-around', minHeight: 240 }}>
            {/* SVG Pie Chart */}
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {categorySales.map((item, index) => {
                  const percentage = item.value
                  const angle = (percentage / 100) * 360
                  
                  // Compute slice path
                  const x1 = center + radius * Math.cos((accumulatedAngle - 90) * Math.PI / 180)
                  const y1 = center + radius * Math.sin((accumulatedAngle - 90) * Math.PI / 180)
                  
                  accumulatedAngle += angle
                  
                  const x2 = center + radius * Math.cos((accumulatedAngle - 90) * Math.PI / 180)
                  const y2 = center + radius * Math.sin((accumulatedAngle - 90) * Math.PI / 180)
                  
                  const largeArcFlag = percentage > 50 ? 1 : 0
                  
                  const pathData = `
                    M ${center} ${center}
                    L ${x1} ${y1}
                    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                    Z
                  `

                  const isHovered = hoveredPieIndex === index
                  
                  return (
                    <path
                      key={item.name}
                      d={pathData}
                      fill={item.color}
                      stroke="var(--surface)"
                      strokeWidth={isHovered ? 4 : 1.5}
                      style={{
                        cursor: 'pointer',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: '100px 100px',
                        transition: 'all 0.2s ease-in-out',
                      }}
                      onMouseEnter={() => setHoveredPieIndex(index)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    />
                  )
                })}
                {/* Center Cutout for Donut Style */}
                <circle cx="100" cy="100" r="38" fill="var(--surface)" />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', tracking: 1 }}>Total</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-h)' }}>{formatCurrency(totalAmount)}</div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 160 }}>
              {categorySales.map((item, index) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: hoveredPieIndex === index ? 'var(--surface-3)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={() => setHoveredPieIndex(index)}
                  onMouseLeave={() => setHoveredPieIndex(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 12, color: 'var(--text-h)', fontWeight: hoveredPieIndex === index ? 600 : 400 }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Revenue Bar Graph */}
        <div style={chartCard}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-h)' }}>Revenue Overview</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total revenue generated month-on-month</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 240, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '80%', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              {monthlySales.map((item) => {
                const maxVal = Math.max(...monthlySales.map(m => m.value))
                const barHeight = `${(item.value / maxVal) * 100}%`
                return (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                    {/* Tooltip on Hover */}
                    <div style={barWrapper} className="group-bar">
                      <div style={tooltip}>
                        {formatCurrency(item.value)}
                      </div>
                      <div style={{
                        height: barHeight,
                        width: 24,
                        background: 'var(--primary)',
                        borderRadius: '4px 4px 0 0',
                        opacity: 0.85,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scaleY(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scaleY(1)'; }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
                  </div>
                )
              })}
            </div>
            {/* Y Axis Guide Lines */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed var(--border)', opacity: 0.4 }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed var(--border)', opacity: 0.4 }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed var(--border)', opacity: 0.4 }} />
          </div>
        </div>

      </div>

      {/* Secondary Row: Sales Trend Line Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={chartCard}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-h)' }}>Weekly Orders Trend</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Traffic/sales frequency throughout the week</p>
          </div>
          <div style={{ height: 200, width: '100%', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 700 160" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="var(--border)" strokeDasharray="3 3" opacity="0.3" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="var(--border)" strokeDasharray="3 3" opacity="0.3" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="var(--border)" strokeDasharray="3 3" opacity="0.3" />
              
              {/* Path calculation for Line Chart */}
              <path
                d="M 10 130 Q 110 90, 210 100 T 410 40 T 610 50 T 690 10"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              
              {/* Gradient fill area */}
              <path
                d="M 10 130 Q 110 90, 210 100 T 410 40 T 610 50 T 690 10 L 690 150 L 10 150 Z"
                fill="url(#grad)"
                opacity="0.12"
              />

              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data points */}
              <circle cx="210" cy="100" r="5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx="410" cy="40" r="5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx="610" cy="50" r="5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0', fontSize: 11, color: 'var(--text-muted)' }}>
              {trendData.map(t => <span key={t.day}>{t.day}</span>)}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .group-bar {
          position: relative;
          display: flex;
          justify-content: center;
          width: 100%;
          height: 100%;
          align-items: flex-end;
        }
        .group-bar:hover div:first-of-type {
          opacity: 1 !important;
          transform: translateY(-8px) scale(1) !important;
        }
      `}</style>
    </div>
  )
}

// Styling definitions
const statBox = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '18px 20px',
  boxShadow: 'var(--shadow-xs)',
}

const iconWrapper = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const dropdownBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--surface)',
  color: 'var(--text-h)',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
}

const chartCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '20px 24px',
  boxShadow: 'var(--shadow-xs)',
}

const barWrapper = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
}

const tooltip = {
  position: 'absolute',
  top: -30,
  background: 'var(--text-h)',
  color: 'var(--surface)',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 600,
  pointerEvents: 'none',
  opacity: 0,
  transform: 'translateY(0) scale(0.95)',
  transition: 'all 0.15s ease-in-out',
  whiteSpace: 'nowrap',
  boxShadow: 'var(--shadow-md)',
}

export default AnalyticsPage
