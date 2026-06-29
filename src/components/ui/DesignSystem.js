/**
 * Design tokens — aligned with the CSS custom properties in index.css.
 * Used by pages/components that reference designTokens or getLuxuryColorClasses.
 */
const designTokens = {
  colors: {
    primary:  'var(--primary)',
    text:     'var(--text)',
    textH:    'var(--text-h)',
    muted:    'var(--text-muted)',
    bg:       'var(--surface)',
    bg2:      'var(--surface-2)',
    border:   'var(--border)',
    deepOlive: 'var(--primary)',
    charcoalBlack: 'var(--surface-2)',
  },
  shadows: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    // legacy aliases
    luxuryShadow: 'var(--shadow-md)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    none: '0',
    sm:   '6px',
    md:   '8px',
    lg:   '10px',
    xl:   '12px',
    '2xl':'14px',
    full: '9999px',
  },
  typography: {
    fontSans:    'var(--sans)',
    fontHeading: 'var(--sans)',
    fontMono:    'ui-monospace, Consolas, monospace',
    sizes: {
      xs:   '11px',
      sm:   '12px',
      base: '13px',
      lg:   '14px',
      xl:   '16px',
      '2xl':'18px',
      '3xl':'20px',
    },
    weights: {
      normal:   '400',
      medium:   '500',
      semibold: '600',
      bold:     '700',
    },
  },
}

/**
 * Returns inline style objects for a named "color" slot.
 * Other pages call this — keep it working.
 */
const getLuxuryColorClasses = (color = 'default') => {
  const map = {
    olive:    { iconBg: '#f0fdf4', iconColor: '#16a34a', accent: '#16a34a' },
    gold:     { iconBg: '#fffbeb', iconColor: '#d97706', accent: '#d97706' },
    charcoal: { iconBg: '#f8fafc', iconColor: '#64748b', accent: '#64748b' },
    blue:     { iconBg: '#eff6ff', iconColor: '#2563eb', accent: '#2563eb' },
    default:  { iconBg: 'var(--surface-3)', iconColor: 'var(--text)', accent: 'var(--primary)' },
  }
  const c = map[color] || map.default
  return {
    // legacy class-string shape — now returns style objects instead
    base:      { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-xs)' },
    iconStyle: { background: c.iconBg, color: c.iconColor, width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    accent:    c.accent,
    // legacy string properties (for Tailwind-based components still in use)
    bg:     '',
    border: '',
    text:   '',
    gradient: '',
    hover:  { shadow: '' },
  }
}

const getLuxuryStatusBadgeClasses = (type, status) => {
  const all = {
    active:    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Active'     },
    inactive:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Inactive'   },
    draft:     { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', label: 'Draft'      },
    pending:   { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Pending'    },
    confirmed: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Confirmed'  },
    packed:    { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', label: 'Packed'     },
    shipped:   { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe', label: 'Shipped'    },
    delivered: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Delivered'  },
    cancelled: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Cancelled'  },
    expired:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'Expired'    },
    used_up:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Used Up'    },
  }
  return all[status] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', label: status || '—' }
}

export { designTokens, getLuxuryColorClasses, getLuxuryStatusBadgeClasses }