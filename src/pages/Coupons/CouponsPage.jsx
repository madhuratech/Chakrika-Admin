/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
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
import { Ticket, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({ code: '', discount: '', type: 'percentage', startDate: '', endDate: '', usageLimit: '', status: 'active' })
  const [formErrors, setFormErrors] = useState({})

  const mapCoupon = (c) => ({
    id: c.id,
    code: c.code,
    discount: c.discount,
    type: c.type,
    startDate: c.start_date,
    endDate: c.end_date,
    usageLimit: c.usage_limit,
    usedCount: c.used_count,
    status: c.status,
    createdAt: c.created_at,
  })

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/coupons')
      setCoupons(response.data.map(mapCoupon))
    } catch {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter === 'active') {
      matchesStatus = coupon.status === 'active' && !isExpired(coupon.endDate) && coupon.usedCount < coupon.usageLimit
    } else if (statusFilter === 'inactive') {
      matchesStatus = coupon.status === 'inactive'
    } else if (statusFilter === 'expired') {
      matchesStatus = isExpired(coupon.endDate)
    } else if (statusFilter === 'used_up') {
      matchesStatus = coupon.usedCount >= coupon.usageLimit
    }
    
    return matchesSearch && matchesStatus
  })

  const handleCreate = () => {
    setSelectedCoupon(null)
    setFormData({ code: '', discount: '', type: 'percentage', startDate: '', endDate: '', usageLimit: '', status: 'active' })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code || '',
      discount: coupon.discount || '',
      type: coupon.type || 'percentage',
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      status: coupon.status || 'active',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleDelete = (coupon) => {
    setSelectedCoupon(coupon)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await apiService.delete(`/coupons/${selectedCoupon.id}`)
      toast.success('Coupon deleted successfully')
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon')
    }
    setIsDeleteDialogOpen(false)
    setSelectedCoupon(null)
  }

  const toggleStatus = async (coupon) => {
    try {
      await apiService.patch(`/coupons/${coupon.id}/toggle-status`)
      fetchCoupons()
      toast.success('Status updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.code.trim()) errors.code = 'Coupon code is required'
    if (!formData.discount || Number(formData.discount) <= 0) {
      errors.discount = 'Discount must be greater than 0'
    } else if (formData.type === 'percentage' && Number(formData.discount) > 100) {
      errors.discount = 'Percentage discount cannot exceed 100%'
    }
    if (!formData.startDate) errors.startDate = 'Start date is required'
    if (!formData.endDate) errors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date'
    }
    if (!formData.usageLimit || Number(formData.usageLimit) <= 0) {
      errors.usageLimit = 'Usage limit must be at least 1'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form validation errors')
      return
    }

    try {
      const payload = {
        code: formData.code,
        discount: Number(formData.discount),
        type: formData.type,
        start_date: formData.startDate,
        end_date: formData.endDate,
        usage_limit: Number(formData.usageLimit),
        status: formData.status,
      }
      if (selectedCoupon) {
        await apiService.put(`/coupons/${selectedCoupon.id}`, payload)
        toast.success('Coupon updated successfully')
      } else {
        await apiService.post('/coupons', payload)
        toast.success('Coupon created successfully')
      }
      setIsFormOpen(false)
      fetchCoupons()
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDiscountDisplay = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.discount}% OFF`
    } else {
      return `Flat ${formatCurrency(coupon.discount)} OFF`
    }
  }

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date()
  }

  const columns = [
    {
      id: 'code',
      header: 'Coupon Code',
      accessor: (row) => row.code,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-soft-gold/10 to-transparent rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-soft-gold" />
          </div>
          <div>
            <p className="font-medium text-text-h">{row.code}</p>
            <p className="text-sm text-text">{getDiscountDisplay(row)}</p>
          </div>
        </div>
      )
    },
    {
      id: 'discount',
      header: 'Discount',
      accessor: (row) => row.discount,
      cell: (row) => (
        <div className="font-semibold text-text-h">{getDiscountDisplay(row)}</div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-1 bg-gray-100/50 dark:bg-white/5 rounded-lg text-sm text-text">
          {row.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
        </span>
      )
    },

    {
      id: 'dates',
      header: 'Valid Until',
      accessor: (row) => row.endDate,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-text" />
            <span className={`text-sm ${isExpired(row.endDate) ? 'text-red-600 dark:text-red-400' : 'text-text'}`}>{
              formatDate(row.endDate)
            }</span>
          </div>
          {isExpired(row.endDate) && (
            <span className="inline-flex items-center px-2 py-1 bg-red-100/50 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
              Expired
            </span>
          )}
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: (row) => row.usedCount,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-text" />
            <span className="text-text">{row.usedCount} / {row.usageLimit}</span>
          </div>
          <div className="w-20 bg-gray-200/50 dark:bg-white/5 rounded-full h-2">
            <div 
              className="bg-soft-gold h-2 rounded-full"
              style={{ width: `${(row.usedCount / row.usageLimit) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      cell: (row) => (
        <StatusBadge status={row.status} type="coupon" />
      )
    },
    {
      id:
        'actions',
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
        title="Coupons"
        description="Create and manage discount coupons to attract customers and drive sales with special offers."
        actions={
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Coupon</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Coupons"
          value={coupons.length}
          icon={<Ticket className="w-5 h-5" />}
          color="olive"
        />
        <StatsCard
          title="Active Coupons"
          value={coupons.filter(c => c.status === 'active' && !isExpired(c.endDate)).length}
          icon={<Ticket className="w-5 h-5" />}
          color="gold"
        />
        <StatsCard
          title="Expired Coupons"
          value={coupons.filter(c => isExpired(c.endDate)).length}
          icon={<Ticket className="w-5 h-5" />}
          color="charcoal"
        />
        <StatsCard
          title="Total Usage"
          value={coupons.reduce((sum, c) => sum + c.usedCount, 0)}
          icon={<Ticket className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <SearchBar
            placeholder="Search coupons..."
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
              <option value="expired">Expired</option>
              <option value="used_up">Used Up</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soft-gold" />
        </div>
      ) : filteredCoupons.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredCoupons}
          emptyState={
            <EmptyState
              title="No coupons found"
              description="Try adjusting your search or filters to find what you're looking for."
              icon="💰"
            />
          }
        />
      ) : (
        <EmptyState
          title="No coupons found"
          description="Try adjusting your search or filters to find what you're looking for."
          icon="💰"
          action={
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-soft-gold to-yellow-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium cursor-pointer"
            >
              Add First Coupon
            </button>
          }
        />
      )}

      <SlideOverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCoupon ? 'Edit Coupon' : 'Add New Coupon'}
        subtitle={selectedCoupon ? 'Update details of this active promotion' : 'Configure code, value metrics and validity dates'}
        size="md"
      >
        <div className="space-y-6 pb-20">
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Coupon Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                formErrors.code ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
              }`}
              placeholder="e.g. WELCOME20"
            />
            {formErrors.code && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.code}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Discount Value <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={formData.discount}
                onChange={e => setFormData({ ...formData, discount: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                  formErrors.discount ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                }`}
                placeholder="20"
              />
              {formErrors.discount && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.discount}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Discount Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                  formErrors.startDate ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                }`}
              />
              {formErrors.startDate && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                  formErrors.endDate ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                }`}
              />
              {formErrors.endDate && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.endDate}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Usage Limit <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
              className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                formErrors.usageLimit ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
              }`}
              placeholder="100"
            />
            {formErrors.usageLimit && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.usageLimit}</p>}
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          {/* Sticky Modal Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-charcoal-black/90 backdrop-blur-md px-8 py-4 border-t border-border/50 flex justify-end gap-3 z-20">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-6 py-2.5 text-xs text-text hover:text-text-h border border-border/60 rounded-xl transition-colors font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-deep-olive to-green-700 hover:from-green-700 hover:to-deep-olive text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {selectedCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </div>
      </SlideOverForm>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Coupon"
        description={`Are you sure you want to delete the coupon code "${selectedCoupon?.code}"? This action cannot be undone.`}
        confirmText="Delete Coupon"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default CouponsPage
