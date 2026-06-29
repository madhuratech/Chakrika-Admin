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
import apiService from '../../services/api'
import { ShoppingBag, Plus, Edit, Trash2, Clock, Package, CreditCard, CheckCircle, Download } from 'lucide-react'
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
    payment_status: 'pending',
    order_status: 'pending',
  })

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

  useEffect(() => {
    fetchOrders()
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
    setFormData({ id: '', customer_name: '', customer_email: '', customer_phone: '', payment_status: 'pending', order_status: 'pending' })
    setIsFormOpen(true)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setFormData({
      id: order.id,
      customer_name: order.customer?.name || '',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      payment_status: order.paymentStatus || 'pending',
      order_status: order.orderStatus || 'pending',
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order')
    }
    setIsDeleteDialogOpen(false)
    setSelectedOrder(null)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiService.patch(`/orders/${orderId}/status`, { status: newStatus })
      toast.success('Order status updated')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

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
            <tr>
              <td class="label">Order Number:</td>
              <td class="value">${order.order_number || order.id}</td>
            </tr>
            <tr>
              <td class="label">Date:</td>
              <td class="value">${new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td class="label">Payment Method:</td>
              <td class="value">${(order.payment_method || 'razorpay').toUpperCase()}</td>
            </tr>
            <tr>
              <td class="label">Payment Status:</td>
              <td class="value">${(order.paymentStatus || order.payment_status || 'pending').toUpperCase()}</td>
            </tr>
            <tr>
              <td class="label">Customer Phone:</td>
              <td class="value">${order.customer?.phone || order.customer_phone || ''}</td>
            </tr>
          </table>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items && order.items.length > 0 ? order.items.map(item => `
                <tr>
                  <td>
                    <div style="font-weight: bold;">${item.product_name}</div>
                    <div style="font-size: 11px; color: #777; margin-top: 2px;">${item.blouse_option || 'Standard'}</div>
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="3" style="text-align: center; color: #999; padding: 20px;">No items in order</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${parseFloat(order.subtotal || order.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row">
              <span>Shipping Charge:</span>
              <span>${parseFloat(order.shipping_charge || 0) === 0 ? 'Complimentary' : '₹' + parseFloat(order.shipping_charge).toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row grand">
              <span>Total Amount:</span>
              <span>₹${parseFloat(order.amount || order.total_amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div class="footer">
            Thank you for shopping at Chakrika!<br>
            For any queries, contact support@chakrikacurations.com
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${order.order_number || order.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFormSubmit = async () => {
    try {
      await apiService.put(`/orders/${selectedOrder.id}`, formData)
      toast.success('Order updated successfully')
      setIsFormOpen(false)
      fetchOrders()
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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

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
      )
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
      )
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
      )
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: (row) => row.amount,
      cell: (row) => (
        <div className="font-semibold text-text-h">{formatCurrency(row.amount)}</div>
      )
    },
    {
      id: 'paymentMethod',
      header: 'Payment Method',
      accessor: (row) => row.payment_method,
      cell: (row) => (
        <div className="text-xs uppercase font-semibold text-text-h bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
          {row.payment_method || 'razorpay'}
        </div>
      )
    },
    {
      id: 'paymentStatus',
      header: 'Payment Status',
      accessor: (row) => row.paymentStatus,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <StatusBadge status={row.paymentStatus} type="order" />
        </div>
      )
    },
    {
      id: 'orderStatus',
      header: 'Order Status',
      accessor: (row) => row.orderStatus,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <StatusBadge status={row.orderStatus} type="order" />
          <select
            onChange={(e) => updateOrderStatus(row.id, e.target.value)}
            value={row.orderStatus}
            className="ml-2 px-2 py-1 text-xs bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDownloadInvoice(row)}
            title="Download Invoice"
            className="p-2 text-text hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-text hover:text-red-600 hover:bg-red-100/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

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
        <StatsCard
          title="Total Orders"
          value={orders.length}
          icon={<ShoppingBag className="w-5 h-5" />}
          color="olive"
        />
        <StatsCard
          title="Pending Orders"
          value={orders.filter(o => o.orderStatus === 'pending').length}
          icon={<Clock className="w-5 h-5" />}
          color="gold"
        />
        <StatsCard
          title="Delivered Orders"
          value={orders.filter(o => o.orderStatus === 'delivered').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(orders.reduce((sum, o) => sum + (o.amount || 0), 0))}
          icon={<CreditCard className="w-5 h-5" />}
          color="olive"
        />
      </div>

      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <SearchBar
            placeholder="Search orders..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
          />
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
            >
              <option value="all">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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
            <EmptyState
              title="No orders found"
              description="Try adjusting your search or filters to find what you're looking for."
              icon="🛒"
              action={
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Create First Order
                </button>
              }
            />
          }
        />
      ) : (
        <EmptyState
          title="No orders found"
          description="Try adjusting your search or filters to find what you're looking for."
          icon="🛒"
          action={
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
            >
              Create First Order
            </button>
          }
        />
      )}

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
          
          <div>
            <label className="block text-sm font-medium text-text-h mb-2">Payment Status</label>
            <select
              className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
              value={formData.payment_status}
              onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-h mb-2">Order Status</label>
            <select
              className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
              value={formData.order_status}
              onChange={e => setFormData({ ...formData, order_status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-6 py-3 text-text hover:text-text-h transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              className="px-6 py-3 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
            >
              {selectedOrder ? 'Update' : 'Create'} Order
            </button>
          </div>
        </div>
      </SlideOverForm>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        description={`Are you sure you want to delete ${selectedOrder?.id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default OrdersPage
