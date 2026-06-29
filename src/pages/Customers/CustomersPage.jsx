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
import { Users, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Mail, Phone, Calendar, ShoppingBag, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const mapCustomer = (item) => ({
  ...item,
  ordersCount: item.orders_count ?? item.order_count ?? item.ordersCount ?? 0,
  totalSpend: Number(item.total_spend ?? item.totalSpend ?? 0),
  joinDate: item.join_date ?? item.joinDate ?? item.created_at,
  lastOrderDate: item.last_order_date ?? item.lastOrderDate,
  status: item.status || 'active',
  avatar: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'U')}&background=6B7C53&color=fff&size=128`,
})

const CustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'active' })

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/customers')
      setCustomers(response.data.map(mapCustomer))
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phone || '').includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreate = () => {
    setSelectedCustomer(null)
    setFormData({ name: '', email: '', phone: '', status: 'active' })
    setIsFormOpen(true)
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status || 'active',
    })
    setIsFormOpen(true)
  }

  const handleDelete = (customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await apiService.delete(`/customers/${selectedCustomer.id}`)
      toast.success('Customer deleted successfully')
      fetchCustomers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer')
    }
    setIsDeleteDialogOpen(false)
    setSelectedCustomer(null)
  }

  const toggleStatus = async (customer) => {
    try {
      await apiService.patch(`/customers/${customer.id}/toggle-status`)
      fetchCustomers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  const handleFormSubmit = async () => {
    try {
      if (selectedCustomer) {
        await apiService.put(`/customers/${selectedCustomer.id}`, formData)
        toast.success('Customer updated successfully')
      } else {
        await apiService.post('/customers', formData)
        toast.success('Customer created successfully')
      }
      setIsFormOpen(false)
      fetchCustomers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
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
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const columns = [
    {
      id: 'name',
      header: 'Customer',
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100/50 dark:bg-white/5 rounded-full overflow-hidden">
            <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-text-h">{row.name}</p>
            <p className="text-sm text-text">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: (row) => row.phone,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-text" />
            <span className="text-sm text-text">{row.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-text" />
            <span className="text-sm text-text">{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      id: 'ordersCount',
      header: 'Orders',
      accessor: (row) => row.ordersCount,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-text" />
          <span className="font-medium text-text-h">{row.ordersCount}</span>
        </div>
      )
    },
    {
      id: 'totalSpend',
      header: 'Total Spend',
      accessor: (row) => row.totalSpend,
      cell: (row) => (
        <div className="font-semibold text-text-h">{formatCurrency(row.totalSpend)}</div>
      )
    },
    {
      id:
        'joinDate',
      header: 'Join Date',
      accessor: (row) => row.joinDate,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-text" />
          <span className="text-text">{formatDate(row.joinDate)}</span>
        </div>
      )
    },
    {
      id: 'lastOrder',
      header: 'Last Order',
      accessor: (row) => row.lastOrderDate,
      cell: (row) => (
        <span className="text-text">{formatDate(row.lastOrderDate)}</span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      cell: (row) => (
        <StatusBadge status={row.status} type="customer" />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleStatus(row)}
            className="p-2 text-text hover:text-green-600 hover:bg-green-100/50 rounded-lg transition-colors"
          >
            {row.status === 'active' ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
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
        title="Customers"
        description="Manage your customer relationships with detailed profiles, order history, and personalized service."
        actions={
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={customers.length}
          icon={<Users className="w-5 h-5" />}
          color="olive"
        />
        <StatsCard
          title="Active Customers"
          value={customers.filter(c => c.status === 'active').length}
          icon={<Users className="w-5 h-5" />}
          color="gold"
        />
        <StatsCard
          title="Inactive Customers"
          value={customers.filter(c => c.status === 'inactive').length}
          icon={<Users className="w-5 h-5" />}
          color="charcoal"
        />
        <StatsCard
          title="Avg. Order Value"
          value={formatCurrency(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length : 0)}
          icon={<CreditCard className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <SearchBar
            placeholder="Search customers..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-olive" />
        </div>
      ) : filteredCustomers.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredCustomers}
          emptyState={
            <EmptyState
              title="No customers found"
              description="Try adjusting your search or filters to find what you're looking for."
              icon="👥"
              action={
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Add First Customer
                </button>
              }
            />
          }
        />
      ) : (
        <EmptyState
          title="No customers found"
          description="Try adjusting your search or filters to find what you're looking for."
          icon="👥"
          action={
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
            >
              Add First Customer
            </button>
          }
        />
      )}

      <SlideOverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-h mb-2">Customer Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-h mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                placeholder="customer@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-h mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-h mb-2">Status</label>
            <select
              className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              {selectedCustomer ? 'Update' : 'Create'} Customer
            </button>
          </div>
        </div>
      </SlideOverForm>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${selectedCustomer?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default CustomersPage
