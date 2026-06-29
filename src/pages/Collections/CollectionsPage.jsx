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
import ImageUploader from '../../components/ui/ImageUploader'
import apiService from '../../services/api'
import { ShoppingBag, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Eye, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const initialFormData = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  banner_image: '',
  thumbnail_image: '',
  displayOrder: '',
  status: 'active'
}

const CollectionsPage = () => {
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null)
  
  // Filters & search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})

  const fetchCollections = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const response = await apiService.get('/collections')
      const mapped = response.data.map(item => ({
        ...item,
        category_id: item.category_id || '',
        category: item.category_name || item.category || '',
        thumbnailImage: item.thumbnail_image,
        bannerImage: item.banner_image,
        displayOrder: item.display_order,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))
      setCollections(mapped)
    } catch {
      toast.error('Failed to load collections')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const result = await apiService.get('/categories')
      setCategories(result.data || result)
    } catch {
      toast.error('Failed to load categories')
    }
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchCollections(false),
        fetchCategories()
      ])
    } catch {
      toast.error('Failed to load collections or categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
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

  // Validate form
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Collection name is required'
    if (!formData.slug.trim()) errors.slug = 'Slug is required'
    if (!formData.category_id) errors.category_id = 'Category belongs-to field is required'
    if (!formData.status) errors.status = 'Status is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Filters combined
  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (collection.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || String(collection.category_id) === String(categoryFilter)
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleCreate = () => {
    setSelectedCollection(null)
    setFormData(initialFormData)
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleEdit = (collection) => {
    setSelectedCollection(collection)
    setFormData({
      name: collection.name || '',
      slug: collection.slug || '',
      category_id: collection.category_id || '',
      description: collection.description || '',
      banner_image: collection.bannerImage || '',
      thumbnail_image: collection.thumbnailImage || '',
      displayOrder: collection.displayOrder || '',
      status: collection.status || 'active',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleView = (collection) => {
    setSelectedCollection(collection)
    setIsViewOpen(true)
  }

  const handleDuplicate = async (collection) => {
    try {
      const payload = {
        name: `${collection.name} (Copy)`,
        slug: `${collection.slug}-copy-${Date.now().toString().slice(-4)}`,
        category_id: collection.category_id ? Number(collection.category_id) : null,
        description: collection.description,
        banner_image: collection.bannerImage,
        thumbnail_image: collection.thumbnailImage,
        display_order: Number(collection.displayOrder || 0) + 1,
        status: 'inactive' // default to inactive
      }
      await apiService.post('/collections', payload)
      toast.success('Collection duplicated successfully')
      fetchCollections(false)
    } catch {
      toast.error('Failed to duplicate collection')
    }
  }

  const handleDelete = (collection) => {
    setSelectedCollection(collection)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await apiService.delete(`/collections/${selectedCollection.id}`)
      toast.success('Collection deleted successfully')
      fetchCollections(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete collection')
    }
    setIsDeleteDialogOpen(false)
    setSelectedCollection(null)
  }

  const toggleStatus = async (collection) => {
    try {
      await apiService.patch(`/collections/${collection.id}/toggle-status`)
      toast.success('Collection status updated')
      fetchCollections(false)
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
      const payload = {
        name: formData.name,
        slug: formData.slug,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        description: formData.description,
        banner_image: formData.banner_image || null,
        thumbnail_image: formData.thumbnail_image || null,
        display_order: Number(formData.displayOrder || 0),
        status: formData.status,
      }
      if (selectedCollection) {
        await apiService.put(`/collections/${selectedCollection.id}`, payload)
        toast.success('Collection updated successfully')
      } else {
        await apiService.post('/collections', payload)
        toast.success('Collection created successfully')
      }
      setIsFormOpen(false)
      fetchCollections(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const columns = [
    {
      id: 'name',
      header: 'Collection Name',
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100/50 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-border/20">
            {row.thumbnailImage ? (
              <img src={row.thumbnailImage} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl bg-deep-olive/10 text-deep-olive">🎨</div>
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
      id: 'category',
      header: 'Category belongs-to',
      accessor: (row) => row.category,
      cell: (row) => (
        <span className="px-2 py-1 bg-deep-olive/10 text-deep-olive text-xs font-semibold rounded-lg">
          {row.category || 'Unassigned'}
        </span>
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
        <span className="font-medium text-text-h">{row.productCount}</span>
      )
    },
    {
      id: 'displayOrder',
      header: 'Display Order',
      accessor: (row) => row.displayOrder,
      cell: (row) => (
        <span className="text-text font-mono font-medium">{row.displayOrder}</span>
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
        title="Collections"
        description="Create and manage product collections, associate them with categories, and showcase your luxury saree ranges."
        actions={
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Collection</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Collections"
          value={collections.length}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="olive"
          trend="up"
          trendValue="12.5"
        />
        <StatsCard
          title="Active Collections"
          value={collections.filter(c => c.status === 'active').length}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="gold"
          trend="up"
          trendValue="8.2"
        />
        <StatsCard
          title="Inactive Collections"
          value={collections.filter(c => c.status === 'inactive').length}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="charcoal"
          trend="down"
          trendValue="2.1"
        />
        <StatsCard
          title="Total Curated Products"
          value={collections.reduce((sum, c) => sum + c.productCount, 0)}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="olive"
          trend="up"
          trendValue="15.3"
        />
      </div>

      {/* Filters and search */}
      <div className="bg-white/80 dark:bg-charcoal-black/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SearchBar
              placeholder="Search collections..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-full"
            />
          </div>
          <div>
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
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-olive" />
        </div>
      ) : filteredCollections.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredCollections}
          emptyState={
            <EmptyState
              title="No collections found"
              description="Adjust your search or filters to locate curated collections."
              icon="🎨"
            />
          }
        />
      ) : (
        <EmptyState
          title="No collections found"
          description="Adjust your search or filters to locate curated collections."
          icon="🎨"
          action={
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-deep-olive to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium cursor-pointer"
            >
              Add First Collection
            </button>
          }
        />
      )}

      {/* Collection Create/Edit Center Modal */}
      <SlideOverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCollection ? 'Edit Collection' : 'Add New Collection'}
        subtitle={selectedCollection ? 'Update this custom sarees grouping' : 'Configure display order, imagery and associated category'}
        size="md"
        footer={
          <>
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
              {selectedCollection ? 'Update Collection' : 'Create Collection'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Collection Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                  formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                }`}
                placeholder="e.g. Wedding Heritage"
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Category Belongs To <span className="text-red-500">*</span></label>
              <select
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                  formErrors.category_id ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {formErrors.category_id && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.category_id}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Slug <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 ${
                  formErrors.slug ? 'border-red-500 focus:border-red-500' : 'border-border/60 focus:border-deep-olive/30'
                }`}
                placeholder="wedding-heritage"
              />
              {formErrors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.slug}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={e => setFormData({ ...formData, displayOrder: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30"
                placeholder="1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-h mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-[#1a202c] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-olive/20 focus:border-deep-olive/30 resize-none"
              placeholder="curate detailed description of the sarees in this collection..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Banner Image</label>
              <ImageUploader
                images={formData.banner_image ? [formData.banner_image] : []}
                onChange={(imgs) => setFormData(prev => ({ ...prev, banner_image: imgs[0] || '' }))}
                multiple={false}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-h mb-2">Thumbnail Image</label>
              <ImageUploader
                images={formData.thumbnail_image ? [formData.thumbnail_image] : []}
                onChange={(imgs) => setFormData(prev => ({ ...prev, thumbnail_image: imgs[0] || '' }))}
                multiple={false}
              />
            </div>
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
          
        </div>
      </SlideOverForm>

      {/* Read-Only Details View Modal */}
      <SlideOverForm
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Collection Details"
        subtitle="curated group of thematic sarees"
        size="md"
      >
        {selectedCollection && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-border/40">
                {selectedCollection.thumbnailImage ? (
                  <img src={selectedCollection.thumbnailImage} alt={selectedCollection.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🎨</div>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-text-h">{selectedCollection.name}</h4>
                <p className="text-xs text-text font-mono mt-1">Slug: /{selectedCollection.slug}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-deep-olive/10 text-deep-olive rounded text-[10px] font-semibold">
                    Category: {selectedCollection.category || 'Unassigned'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[10px] text-text font-semibold">
                    Order: {selectedCollection.displayOrder}
                  </span>
                </div>
              </div>
            </div>

            {selectedCollection.description && (
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-text-muted font-bold block uppercase mb-1">Description</span>
                <p className="text-xs text-text leading-relaxed">{selectedCollection.description}</p>
              </div>
            )}

            {selectedCollection.bannerImage && (
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-text-muted font-bold block uppercase mb-2">Banner Asset</span>
                <img src={selectedCollection.bannerImage} className="w-full h-40 object-cover rounded-xl border border-border/20" alt="Banner" />
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

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Collection"
        description={`Are you sure you want to delete the collection "${selectedCollection?.name}"? Associated products will have their collection unassigned.`}
        confirmText="Delete Collection"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default CollectionsPage
