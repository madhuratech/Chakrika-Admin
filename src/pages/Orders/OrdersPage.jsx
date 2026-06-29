/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatsCard } from '../../components/ui/StatsCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { SlideOverForm } from '../../components/ui/SlideOverForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SearchBar } from '../../components/ui/SearchBar'
import { DataTable } from '../../components/tables/DataTable'
import { TimelineModal } from '../../components/orders/TimelineModal'
import apiService from '../../services/api'
import {
  ShoppingBag, Plus, Edit, Trash2, Clock, Package, CreditCard,
  CheckCircle, Download, Eye, Truck, MapPin, Send,
} from 'lucide-react'
import toast from 'react-hot-toast'

const mapOrder = (o) => ({
  ...o,
  customer: {
    name: o.customer_name,
    email: o.customer_email,
    phone: o.customer_phone,
    avatar: o.customer_avatar,
  },
  createdAt: o.created_at,
  orderStatus: o.order_status,
  paymentStatus: o.payment_status,
  amount: o.total_amount || o.amount,
})

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
  })
  // Timeline modal
  const [timelineOrder, setTimelineOrder] = useState(null)
  // Action modals for workflow
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', order: null })
  const [actionData, setActionData] = useState({ courier_company: '', tracking_number: '', tracking_url: '' })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/orders')
      setOrders(response.data.map(mapOrder))
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/orders/stats')
      setStats(response.data)
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = String(order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  const handleCreate = () => {
    setSelectedOrder(null)
    setFormData({ id: '', customer_name: '', customer_email: '', customer_phone: '' })
    setIsFormOpen(true)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setFormData({
      id: order.id,
      customer_name: order.customer?.name || '',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
    })
    setIsFormOpen(true)
  }

  const handleDelete = (order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await apiService.delete(`/orders/${selectedOrder.id}`)
      toast.success('Order deleted successfully')
      fetchOrders()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order')
    }
    setIsDeleteDialogOpen(false)
    setSelectedOrder(null)
  }

  // ── Action-based workflow handlers ──

  const openActionModal = (type, order) => {
    setActionData({ courier_company: '', tracking_number: '', tracking_url: '' })
    setActionModal({ isOpen: true, type, order })
  }

  const submitAction = async () => {
    const { type, order } = actionModal
    try {
      if (type === 'pack') {
        await apiService.post(`/orders/${order.id}/pack`, { courier_company: actionData.courier_company })
        toast.success('Order packed successfully')
      } else if (type === 'dispatch') {
        await apiService.post(`/orders/${order.id}/dispatch`, {
          tracking_number: actionData.tracking_number,
          tracking_url: actionData.tracking_url,
        })
        toast.success('Order dispatched successfully')
      } else if (type === 'pickup') {
        await apiService.post(`/orders/${order.id}/confirm-pickup`)
        toast.success('Pickup confirmed')
      } else if (type === 'deliver') {
        await apiService.post(`/orders/${order.id}/confirm-delivery`)
        toast.success('Delivery confirmed')
      }
      setActionModal({ isOpen: false, type: '', order: null })
      fetchOrders()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order')
    }
  }

  const handleFormSubmit = async () => {
    try {
      await apiService.put(`/orders/${selectedOrder.id}`, formData)
      toast.success('Order updated successfully')
      setIsFormOpen(false)
      fetchOrders()
      fetchStats()
    } catch {
      toast.error('Failed to update order')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  // ── Action button config per status ──

  const getActionButtons = (row) => {
    const buttons = []
    switch (row.orderStatus) {
      case 'confirmed':
        buttons.push({
          label: 'Pack',
          icon: <Package className="w-3.5 h-3.5" />,
          color: '#8B5CF6',
          bg: 'rgba(139,92,246,0.1)',
          hoverBg: 'rgba(139,92,246,0.2)',
          onClick: () => openActionModal('pack', row),
        })
        break
      case 'processing':
        buttons.push({
          label: 'Dispatch',
          icon: <Truck className="w-3.5 h-3.5" />,
          color: '#3B82F6',
          bg: 'rgba(59,130,246,0.1)',
          hoverBg: 'rgba(59,130,246,0.2)',
          onClick: () => openActionModal('dispatch', row),
        })
        break
      case 'shipped':
        buttons.push({
          label: 'Pickup',
          icon: <MapPin className="w-3.5 h-3.5" />,
          color: '#F59E0B',
          bg: 'rgba(245,158,11,0.1)',
          hoverBg: 'rgba(245,158,11,0.2)',
          onClick: () => openActionModal('pickup', row),
        })
        break
      case 'in_transit':
        buttons.push({
          label: 'Deliver',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          color: '#10B981',
          bg: 'rgba(16,185,129,0.1)',
          hoverBg: 'rgba(16,185,129,0.2)',
          onClick: () => openActionModal('deliver', row),
        })
        break
    }
    return buttons
  }

  // ── Column definitions ──

  const columns = [
    {
      id: 'orderId',
      header: 'Order ID',
      accessor: (row) => row.id,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-deep-olive to-green-700 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-text-h">{row.id}</p>
            <p className="text-sm text-text">{formatDate(row.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessor: (row) => row.customer.name,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100/50 dark:bg-white/5 rounded-full overflow-hidden">
            {row.customer.avatar ? (
              <img src={row.customer.avatar} alt={row.customer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text text-sm font-medium">
                {row.customer.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-text-h">{row.customer.name}</p>
            <p className="text-sm text-text">{row.customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'products',
      header: 'Products',
      accessor: (row) => row.products?.length || 0,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-text" />
          <span className="font-medium text-text-h">{row.products?.length || 0}</span>
          <span className="text-sm text-text">items</span>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: (row) => row.amount,
      cell: (row) => (
        <div className="font-semibold text-text-h">{formatCurrency(row.amount)}</div>
      ),
    },
    {
      id: 'paymentMethod',
      header: 'Payment Method',
      accessor: (row) => row.payment_method,
      cell: (row) => (
        <div className="text-xs uppercase font-semibold text-text-h bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
          {row.payment_method || 'razorpay'}
        </div>
      ),
    },
    {
      id: 'paymentStatus',
      header: 'Payment Status',
      accessor: (row) => row.paymentStatus,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <StatusBadge status={row.paymentStatus} type="order" />
        </div>
      ),
    },
    {
      id: 'orderStatus',
      header: 'Order Status',
      accessor: (row) => row.orderStatus,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <StatusBadge status={row.orderStatus} type="order" />
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          {/* Workflow action buttons — only shown when status allows */}
          {getActionButtons(row).map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              title={btn.label}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', borderRadius: '8px', border: 'none',
                background: btn.bg, color: btn.color, cursor: 'pointer',
                fontSize: '11px', fontWeight: 600, fontFamily: 'var(--sans)',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.background = btn.hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = btn.bg}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
          {/* Timeline button */}
          <button
            onClick={() => setTimelineOrder(row)}
            title="View Timeline"
            className="p-2 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {/* Download Invoice */}
          <button
            onClick={() => handleDownloadInvoice(row)}
            title="Download Invoice"
            className="p-2 text-text hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          {/* Edit customer info */}
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          {/* Delete */}
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-text hover:text-red-600 hover:bg-red-100/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // ── Invoice download (unchanged) ──

  const handleDownloadInvoice = (order) => {
    const htmlContent = `
      <html>
        <head>
          <title>Invoice - ${order.order_number || order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #8F2D56; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #8F2D56; letter-spacing: 2px; text-transform: uppercase; }
            .subtitle { font-size: 12px; color: #777; margin-top: 5px; }
            .invoice-title { font-size: 20px; margin-top: 20px; font-weight: bold; text-transform: uppercase; color: #111; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .details-table td { padding: 8px 0; font-size: 14px; }
            .details-table td.label { color: #666; width: 40%; }
            .details-table td.value { font-weight: 500; text-align: right; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .items-table th { border-bottom: 2px solid #eee; text-align: left; padding: 10px 5px; font-size: 13px; text-transform: uppercase; color: #666; }
            .items-table td { border-bottom: 1px solid #eee; padding: 12px 5px; font-size: 14px; }
            .total-section { margin-top: 30px; border-top: 2px solid #eee; padding-top: 15px; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
            .total-row.grand { font-size: 18px; font-weight: bold; color: #8F2D56; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Chakrika Curations</div>
            <div class="subtitle">Genuine Handlooms & Sarees</div>
          </div>
          <div class="invoice-title">Invoice / Receipt</div>
          <table class="details-table">
            <tr><td class="label">Order Number:</td><td class="value">${order.order_number || order.id}</td></tr>
            <tr><td class="label">Date:</td><td class="value">${new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><td class="label">Payment Method:</td><td class="value">${(order.payment_method || 'razorpay').toUpperCase()}</td></tr>
            <tr><td class="label">Payment Status:</td><td class="value">${(order.paymentStatus || order.payment_status || 'pending').toUpperCase()}</td></tr>
            <tr><td class="label">Customer Phone:</td><td class="value">${order.customer?.phone || order.customer_phone || ''}</td></tr>
          </table>
          <table class="items-table">
            <thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr></thead>
            <tbody>
              ${order.items && order.items.length > 0 ? order.items.map(item => `
                <tr>
                  <td><div style="font-weight:bold;">${item.product_name}</div><div style="font-size:11px;color:#777;margin-top:2px;">${item.blouse_option || 'Standard'}</div></td>
                  <td style="text-align:center;">${item.quantity}</td>
                  <td style="text-align:right;">₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="3" style="text-align:center;color:#999;padding:20px;">No items in order</td></tr>
              `}
            </tbody>
          </table>
          <div class="total-section">
            <div class="total-row"><span>Subtotal:</span><span>₹${parseFloat(order.subtotal || order.amount || 0).toLocaleString('en-IN')}</span></div>
            <div class="total-row"><span>Shipping Charge:</span><span>${parseFloat(order.shipping_charge || 0) === 0 ? 'Complimentary' : '₹' + parseFloat(order.shipping_charge).toLocaleString('en-IN')}</span></div>
            <div class="total-row grand"><span>Total Amount:</span><span>₹${parseFloat(order.amount || order.total_amount || 0).toLocaleString('en-IN')}</span></div>
          </div>
          <div class="footer">Thank you for shopping at Chakrika!<br>For any queries, contact support@chakrikacurations.com</div>
        </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice_${order.order_number || order.id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Track and manage customer orders with real-time status updates and detailed timelines."
        actions={
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Order</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingBag className="w-5 h-5" />} color="olive" />
        <StatsCard title="Pending Orders" value={stats.pendingOrders} icon={<Clock className="w-5 h-5" />} color="gold" />
        <StatsCard title="Delivered Orders" value={stats.deliveredOrders} icon={<CheckCircle className="w-5 h-5" />} color="blue" />
        <StatsCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<CreditCard className="w-5 h-5" />} color="olive" />
      </div>

      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <SearchBar placeholder="Search orders..." value={searchTerm} onChange={setSearchTerm} className="max-w-md" />
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
            >
              <option value="all">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-olive" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredOrders}
          emptyState={
            <EmptyState title="No orders found" description="Try adjusting your search or filters to find what you're looking for." icon="🛒" action={
              <button onClick={handleCreate} className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">Create First Order</button>
            } />
          }
        />
      ) : (
        <EmptyState title="No orders found" description="Try adjusting your search or filters to find what you're looking for." icon="🛒" action={
          <button onClick={handleCreate} className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">Create First Order</button>
        } />
      )}

      {/* ── Edit/Create Form (customer info only) ── */}
      <SlideOverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedOrder ? 'Edit Order' : 'Create New Order'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-h mb-2">Customer Name</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
              placeholder="Priya Sharma"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-h mb-2">Email</label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-h mb-2">Phone</label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <button onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-text hover:text-text-h transition-colors">Cancel</button>
            <button onClick={handleFormSubmit} className="px-6 py-3 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
              {selectedOrder ? 'Update' : 'Create'} Order
            </button>
          </div>
        </div>
      </SlideOverForm>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        description={`Are you sure you want to delete ${selectedOrder?.id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* ── Timeline Modal ── */}
      <TimelineModal
        isOpen={!!timelineOrder}
        onClose={() => setTimelineOrder(null)}
        order={timelineOrder}
      />

      {/* ── Action Modals (Pack / Dispatch / Pickup / Deliver) ── */}
      {actionModal.isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.25)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={() => setActionModal({ isOpen: false, type: '', order: null })}
          />
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            padding: '24px', maxWidth: '420px', width: '100%',
            position: 'relative', zIndex: 10,
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-h)', margin: '0 0 16px' }}>
              {actionModal.type === 'pack' && 'Pack Order'}
              {actionModal.type === 'dispatch' && 'Dispatch Order'}
              {actionModal.type === 'pickup' && 'Confirm Pickup'}
              {actionModal.type === 'deliver' && 'Mark as Delivered'}
            </h3>

            {actionModal.type === 'pack' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-h)', marginBottom: '6px' }}>
                  Courier Company
                </label>
                <input
                  type="text"
                  value={actionData.courier_company}
                  onChange={e => setActionData({ ...actionData, courier_company: e.target.value })}
                  placeholder="e.g. Delhivery, Blue Dart"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'var(--surface-2)',
                    color: 'var(--text-h)', fontSize: '13px', fontFamily: 'var(--sans)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  autoFocus
                />
              </div>
            )}

            {actionModal.type === 'dispatch' && (
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-h)', marginBottom: '6px' }}>
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={actionData.tracking_number}
                    onChange={e => setActionData({ ...actionData, tracking_number: e.target.value })}
                    placeholder="e.g. DH123456789"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      border: '1px solid var(--border)', background: 'var(--surface-2)',
                      color: 'var(--text-h)', fontSize: '13px', fontFamily: 'var(--sans)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-h)', marginBottom: '6px' }}>
                    Tracking URL (optional)
                  </label>
                  <input
                    type="url"
                    value={actionData.tracking_url}
                    onChange={e => setActionData({ ...actionData, tracking_url: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      border: '1px solid var(--border)', background: 'var(--surface-2)',
                      color: 'var(--text-h)', fontSize: '13px', fontFamily: 'var(--sans)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {actionModal.type === 'pickup' && (
              <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '20px', lineHeight: 1.6 }}>
                Confirm that the courier has picked up this order. The status will change to <strong>In Transit</strong>.
              </p>
            )}

            {actionModal.type === 'deliver' && (
              <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '20px', lineHeight: 1.6 }}>
                Confirm that this order has been delivered to the customer. The status will change to <strong>Delivered</strong>.
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActionModal({ isOpen: false, type: '', order: null })}
                style={{
                  padding: '10px 18px', border: '1px solid var(--border)', borderRadius: '10px',
                  background: 'transparent', color: 'var(--text)', fontSize: '13px',
                  fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                style={{
                  padding: '10px 18px', border: 'none', borderRadius: '10px',
                  background: '#16a34a', color: '#fff', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)',
                }}
              >
                {actionModal.type === 'pack' && 'Pack Order'}
                {actionModal.type === 'dispatch' && 'Dispatch'}
                {actionModal.type === 'pickup' && 'Confirm Pickup'}
                {actionModal.type === 'deliver' && 'Mark Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
