import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import LoadingSkeleton from './components/ui/LoadingSkeleton'
import { Agentation } from "agentation"

const DashboardPage  = lazy(() => import('./pages/Dashboard/DashboardPage'))
const CategoriesPage = lazy(() => import('./pages/Categories/CategoriesPage'))
const ProductsPage   = lazy(() => import('./pages/Products/ProductsPage'))
const OrdersPage     = lazy(() => import('./pages/Orders/OrdersPage'))
const CustomersPage  = lazy(() => import('./pages/Customers/CustomersPage'))
const CouponsPage    = lazy(() => import('./pages/Coupons/CouponsPage'))
const CMSPage        = lazy(() => import('./pages/CMS/CMSPage'))
const SettingsPage   = lazy(() => import('./pages/Settings/SettingsPage'))
const EnquiriesPage  = lazy(() => import('./pages/Enquiries/EnquiriesPage'))
const ReviewsPage    = lazy(() => import('./pages/Reviews/ReviewsPage'))
const PolicyPage     = lazy(() => import('./pages/Policy/PolicyPage'))
const LoginPage      = lazy(() => import('./pages/Login/LoginPage'))

function App() {
  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={
                <Suspense fallback={<LoadingSkeleton />}>
                  <LoginPage />
                </Suspense>
              } />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard"  element={<DashboardPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="collections" element={<ProductsPage />} />
                  <Route path="orders"     element={<OrdersPage />} />
                  <Route path="customers"  element={<CustomersPage />} />
                  <Route path="coupons"    element={<CouponsPage />} />
                  <Route path="cms"        element={<CMSPage />} />
                  <Route path="settings"   element={<SettingsPage />} />
                  <Route path="enquiries"  element={<EnquiriesPage />} />
                  <Route path="reviews"    element={<ReviewsPage />} />
                  <Route path="policy"     element={<PolicyPage />} />
                </Route>
              </Route>
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-md)',
                  fontFamily: 'var(--sans)',
                  fontSize: '13px',
                  padding: '10px 14px',
                },
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  )
}

export default App
