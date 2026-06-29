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
import ImageUploader from '../../components/ui/ImageUploader'
import apiService from '../../services/api'
import { Package, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Eye, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const initialFormData = {
  name: '',
  slug: '',
  description: '',
  image: '',
  status: 'active'
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // Search & filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/categories')
      setCategories(response.data || response)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleNameChange = (e) => {
    const nameVal = e.target.value
    const slugVal = nameVal.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    
    setFormData(prev => ({
      ...prev,
      name: nameVal,
      slug: slugVal
    }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Category name is required'
    if (!formData.slug.trim()) errors.slug = 'Slug is required'
    if (!formData.status) errors.status = 'Status is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = (category.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.slug || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleCreate = () => {
    setSelectedCategory(null)
    setFormData(initialFormData)
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
      status: category.status || 'active',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleView = (category) => {
    setSelectedCategory(category)
    setIsViewOpen(true)
  }

  const handleDuplicate = async (category) => {
    try {
      const payload = {
        name: `${category.name} (Copy)`,
        slug: `${category.slug}-copy-${Date.now().toString().slice(-4)}`,
        description: category.description,
        image: category.image,
        status: 'inactive'
      }
      await apiService.post('/categories', payload)
      toast.success('Category duplicated successfully')
      fetchCategories()
    } catch {
      toast.error('Failed to duplicate category')
    }
  }

  const handleDelete = (category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await apiService.delete(`/categories/${selectedCategory.id}`)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
    setIsDeleteDialogOpen(false)
    setSelectedCategory(null)
  }

  const toggleStatus = async (category) => {
    try {
      await apiService.patch(`/categories/${category.id}/toggle-status`)
      toast.success('Category status updated')
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please correct the validation errors in the form')
      return
    }

    try {
      if (selectedCategory) {
        await apiService.put(`/categories/${selectedCategory.id}`, formData)
        toast.success('Category updated successfully')
      } else {
        await apiService.post('/categories', formData)
        toast.success('Category created successfully')
      }
      setIsFormOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const columns = [
    {
      id: 'name',
      header: 'Category Name',
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100/50 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-border/20">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl bg-deep-olive/10 text-deep-olive">📁</div>
            )}
          </div>
          <div>
            <p className="font-medium text-text-h hover:text-deep-olive cursor-pointer" onClick={() => handleView(row)}>{row.name}</p>
            <p className="text-xs text-text">/{row.slug}</p>
          </div>
        </div>
      )
    },
    {
      id: 'description',
      header: 'Description',
      accessor: (row) => row.description,
      cell: (row) => (
        <p className="text-text max-w-xs truncate">{row.description || '—'}</p>
      )
    },
    {
      id: 'productCount',
      header: 'Products',
      accessor: (row) => row.productCount,
      cell: (row) => (
        <span className="font-medium text-text-h">{row.productCount || 0}</span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      cell: (row) => (
        <StatusBadge status={row.status} type="product" />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-text hover:text-deep-olive hover:bg-deep-olive/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDuplicate(row)}
            className="p-1.5 text-text hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleStatus(row)}
            className="p-1.5 text-text hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Toggle Status"
          >
            {row.status === 'active' ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-text hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
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
        title="Categories"
        description="Manage your product categories to organize and display your luxury saree collection."
        actions={
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Categories"
          value={categories.length}
          icon={<Package className="w-5 h-5" />}
          color="olive"
        />
        <StatsCard
          title="Active Categories"
          value={categories.filter(c => c.status === 'active').length}
          icon={<Package className="w-5 h-5" />}
          color="gold"
        />
        <StatsCard
          title="Inactive Categories"
          value={categories.filter(c => c.status === 'inactive').length}
          icon={<Package className="w-5 h-5" />}
          color="charcoal"
        />
        <StatsCard
          title="Avg. Products / Category"
          value={categories.length ? (categories.reduce((sum, c) => sum + (c.productCount || 0), 0) / categories.length).toFixed(1) : '0'}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Filters and search */}
      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            placeholder="Search categories by name, slug..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-olive" />
        </div>
      ) : filteredCategories.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredCategories}
          emptyState={
            <EmptyState
              title="No categories found"
              description="Adjust your search or status filter to locate categories."
              icon="📁"
            />
          }
        />
      ) : (
        <EmptyState
          title="No categories found"
          description="Adjust your search or status filter to locate categories."
          icon="📁"
          action={
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium cursor-pointer"
            >
              Add First Category
            </button>
          }
        />
      )}

      {/* Category Create/Edit Center Modal */}
      <SlideOverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Add New Category'}
        subtitle={selectedCategory ? 'Update this catalog sorting category' : 'Configure description, image branding and listing slug'}
        size="md"
      >
        <div className="space-y-6 pb-20">
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Category Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
              }`}
              placeholder="e.g. Silk Sarees"
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>}
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Slug <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
              className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                formErrors.slug ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
              }`}
              placeholder="silk-sarees"
            />
            {formErrors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.slug}</p>}
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 resize-none"
              placeholder="Enter category description..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Category Image Asset</label>
            <ImageUploader
              images={formData.image ? [formData.image] : []}
              onChange={(imgs) => setFormData(prev => ({ ...prev, image: imgs[0] || '' }))}
              multiple={false}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Status</label>
            <select
              className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
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
              {selectedCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      </SlideOverForm>

      {/* Read-Only Details View Modal */}
      <SlideOverForm
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Category Information"
        subtitle="Catalog classification details"
        size="md"
      >
        {selectedCategory && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-border/40">
                {selectedCategory.image ? (
                  <img src={selectedCategory.image} alt={selectedCategory.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📁</div>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-text-h">{selectedCategory.name}</h4>
                <p className="text-xs text-text font-mono mt-1">Slug: /{selectedCategory.slug}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[10px] text-text font-semibold">
                    Products: {selectedCategory.productCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {selectedCategory.description && (
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-text-muted font-bold block uppercase mb-1">Description</span>
                <p className="text-xs text-text leading-relaxed">{selectedCategory.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-border/20">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-5 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-semibold rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </SlideOverForm>

      {/* Delete confirmation popup */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${selectedCategory?.name}"? All associated products will have their category unassigned.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default CategoriesPage
