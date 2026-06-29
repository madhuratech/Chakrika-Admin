import { useState, Suspense } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, FolderOpen, Package, ShoppingCart,
  Users, Tag, FileText, Settings, Bell, Sun, Moon, Search, X, ChevronLeft, ChevronRight, LogOut,
  MessageSquare, Star, Shield,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'

const menuItems = [
  { path: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/categories', label: 'Categories', icon: FolderOpen      },
  { path: '/collections',label: 'Products',   icon: Package         },
  { path: '/orders',     label: 'Orders',     icon: ShoppingCart    },
  { path: '/customers',  label: 'Customers',  icon: Users           },
  { path: '/coupons',    label: 'Coupons',    icon: Tag             },
  { path: '/enquiries',  label: 'Enquiries',  icon: MessageSquare   },
  { path: '/reviews',    label: 'Reviews',    icon: Star            },
  { path: '/policy',     label: 'Policy',     icon: Shield          },
  { path: '/cms',        label: 'CMS Pages',  icon: FileText        },
  { path: '/settings',   label: 'Settings',   icon: Settings        },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { logout, user } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    const seg = location.pathname.split('/')[1]
    if (!seg || seg === 'dashboard') return 'Dashboard'
    if (seg === 'collections') return 'Products'
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100svh', background: 'var(--surface-2)' }}>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{
              flexShrink: 0,
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'sticky',
              top: 0,
              height: '100svh',
            }}
          >
            {/* Logo */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 32, height: 32,
                background: 'var(--primary)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>C</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h)', lineHeight: 1.2 }}>Chakrika</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>Admin Panel</div>
              </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
              {menuItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    marginBottom: 2,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--primary)' : 'var(--text)',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                  onMouseEnter={e => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.background = 'var(--surface-3)'
                      e.currentTarget.style.color = 'var(--text-h)'
                    }
                  }}
                  onMouseLeave={e => {
                    const isActive = location.pathname === path || (path === '/dashboard' && location.pathname === '/')
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text)'
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User footer */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <div style={{
                  width: 30, height: 30,
                  background: 'var(--surface-3)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--text-h)',
                  flexShrink: 0,
                }}>{user?.username ? user.username[0].toUpperCase() : 'A'}</div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'Admin User'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@chakrika.com'}</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28,
                  border: 'none',
                  borderRadius: 6,
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100svh' }}>

        {/* Header */}
        <header style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          gap: 16,
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32,
                border: '1px solid var(--border)',
                borderRadius: 7,
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>Admin</span>
              <span>/</span>
              <span style={{ color: 'var(--text-h)', fontWeight: 600 }}>{getPageTitle()}</span>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* Search */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ position: 'relative' }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search..."
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 30px',
                        border: '1px solid var(--border)',
                        borderRadius: 7,
                        fontSize: 13,
                        color: 'var(--text-h)',
                        background: 'var(--surface-2)',
                        outline: 'none',
                        fontFamily: 'var(--sans)',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <HeaderIconBtn title="Search" onClick={() => setSearchOpen(v => !v)}>
              {searchOpen ? <X size={15} /> : <Search size={15} />}
            </HeaderIconBtn>

            <HeaderIconBtn title="Notifications" style={{ position: 'relative' }}>
              <Bell size={15} />
              <span style={{
                position: 'absolute', top: 5, right: 5,
                width: 6, height: 6,
                background: '#ef4444',
                borderRadius: '50%',
                border: '1.5px solid var(--surface)',
              }} />
            </HeaderIconBtn>

            <HeaderIconBtn title="Toggle theme" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </HeaderIconBtn>

            <div
              onClick={logout}
              title={`Logged in as ${user?.username || 'admin'}. Click to logout.`}
              style={{
                width: 30, height: 30,
                background: 'var(--primary-light)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: 'var(--primary)',
                cursor: 'pointer',
                marginLeft: 4,
              }}
            >{user?.username ? user.username[0].toUpperCase() : 'A'}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

/* Small helper for header icon buttons */
const HeaderIconBtn = ({ children, onClick, title, style = {} }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32,
      border: '1px solid var(--border)',
      borderRadius: 7,
      background: 'transparent',
      color: 'var(--text)',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.15s',
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    {children}
  </button>
)

export default AdminLayout